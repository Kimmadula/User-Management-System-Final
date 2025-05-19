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
    process.exit(1);
  });

// Middleware setup
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200',
      'https://user-management-system-final-29.onrender.com'
    ];
    if (!origin) return callback(null, true); // Allow tools like Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Debugging middleware
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

// Routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));
app.use('/api-docs', require('./_helpers/swagger'));

app.get('/', (req, res) => {
  res.send('User Management System API is running!');
});

// Catch-all route for unknown endpoints
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found: ' + req.originalUrl });
});

// === Final Global Error Handler ===
app.use((err, req, res, next) => {
  console.error('\n=== Global Error Handler ===');
  console.error('Error:', err);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Body:', req.body);
  if (err.stack) console.error('Error stack:', err.stack);

  // Sequelize specific errors
  if (err.name?.includes('Sequelize')) {
    console.error('🔥 Sequelize error details:', {
      name: err.name,
      message: err.message,
      sql: err.sql,
      params: err.parameters,
      errors: err.errors
    });

    // Show Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: err.errors.map(e => e.message).join(', ')
      });
    }

    // Handle unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: err.errors.map(e => e.message).join(', ') || 'Unique constraint failed'
      });
    }

    // Generic Sequelize error
    return res.status(400).json({
      message: 'Database operation failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Explicit string errors (e.g., thrown manually)
  if (typeof err === 'string') {
    const is404 = err.toLowerCase().endsWith('not found');
    return res.status(is404 ? 404 : 400).json({ message: err });
  }

  // JWT / Auth-related
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Fallback
  return res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? (err.message || err) : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));
