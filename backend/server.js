require('rootpath')();
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const { Sequelize } = require('sequelize');

// Create Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// Export Sequelize instance globally if needed
module.exports = sequelize;

// CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Debugging middleware
app.use((req, res, next) => {
  const requestInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    ...(req.method === 'POST' || req.method === 'PUT' ? { body: req.body } : {})
  };
  console.log('API Request:', JSON.stringify(requestInfo, null, 2));
  next();
});

// Body logging middleware
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`[${req.method}] ${req.url} - Request body:`, JSON.stringify(req.body));
  }
  next();
});

// API routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));

// Swagger
app.use('/api-docs', require('./_helpers/swagger'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);

  if (err.stack) console.error('Error stack:', err.stack);

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
      return res.status(err.toLowerCase().endsWith('not found') ? 404 : 400).json({ message: err });
    case err.name === 'UnauthorizedError':
      return res.status(401).json({ message: 'Unauthorized' });
    case err.name === 'SequelizeValidationError':
      return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
    case err.name === 'SequelizeUniqueConstraintError':
      return res.status(400).json({ message: 'A record with this name already exists' });
    default:
      return res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? (err.message || err) : undefined
      });
  }
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
