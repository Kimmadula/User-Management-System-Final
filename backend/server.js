const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const { sequelize, testSequelize } = require('./_helpers/db');

// Load environment variables
dotenv.config();

// Test and sync database connection
testSequelize()
  .then(() => console.log('Database connection established'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit if database connection fails
  });

// Middleware setup
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200',
      'https://user-management-system-final-29.onrender.com'
    ];
    if (!origin) {
      // Allow REST tools or server-to-server requests with no origin
      return callback(null, false);
    }
    if (allowedOrigins.includes(origin)) {
      // Always reflect the request's origin if allowed
      return callback(null, origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Enhanced Debugging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Cookies:', JSON.stringify(req.cookies, null, 2));
  
  const requestInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    query: req.query,
    params: req.params
  };
  
  if (req.method === 'POST' || req.method === 'PUT') {
    requestInfo.body = req.body;
  }
  
  console.log('Request Details:', JSON.stringify(requestInfo, null, 2));
  next();
});

// API routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));

// Swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

app.get('/', (req, res) => {
  res.send('User Management System API is running!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('\n=== Global Error Handler ===');
  console.error('Error:', err);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Body:', req.body);
  
  if (err.stack) {
    console.error('Error stack:', err.stack);
  }
  
  if (err.name?.includes('Sequelize')) {
    console.error('Sequelize error details:', {
      name: err.name,
      message: err.message,
      sql: err.sql,
      params: err.parameters
    });
    
    const devMessage = process.env.NODE_ENV === 'development' 
      ? `SQL: ${err.sql || 'N/A'}, Message: ${err.message}` 
      : undefined;
      
    return res.status(400).json({ 
      message: 'Database operation failed',
      error: devMessage
    });
  }
  
  switch (true) {
    case typeof err === 'string':
      const is404 = err.toLowerCase().endsWith('not found');
      const statusCode = is404 ? 404 : 400;
      return res.status(statusCode).json({ message: err });
    case err.name === 'UnauthorizedError':
      return res.status(401).json({ message: 'Unauthorized' });
    case err.name === 'SequelizeValidationError':
      return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
    case err.name === 'SequelizeUniqueConstraintError':
      return res.status(400).json({ message: 'A record with this name already exists' });
    default:
      console.error('Unhandled error:', err);
      return res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? (err.message || err) : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
  }
});

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));