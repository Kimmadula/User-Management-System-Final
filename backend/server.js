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
      return callback(null, false);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
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

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found: ' + req.originalUrl });
});


// ** Final error handler replaced here **
app.use((err, req, res, next) => {
  console.error('🔥 Full error object:', err);
  res.status(500).json({
    message: typeof err === 'string' ? err : err.message || 'Unknown error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));
