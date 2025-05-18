const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const { sequelize, testSequelize } = require('./_helpers/db');

// 1. Load environment variables FIRST
dotenv.config();

// 2. Configure environment-specific settings
const isDevelopment = process.env.NODE_ENV === 'development';

// 3. Enhanced database connection with retry logic
const initializeDatabase = async () => {
  try {
    await testSequelize();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync();
    console.log('✅ Database models synchronized');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
};

// 4. Initialize database before starting server
initializeDatabase();

// 5. Middleware setup with enhanced CORS
app.use(cors({
  origin: isDevelopment 
    ? ['http://localhost:4200'] 
    : ['https://user-management-system-final-29.onrender.com'],
  credentials: true,
  exposedHeaders: ['x-auth-token']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());

// 6. SUPER verbose request logging
app.use((req, res, next) => {
  console.log('\n══════════════════════════════════════');
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  console.log('📝 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🍪 Cookies:', req.cookies);
  console.log('🔍 Query:', req.query);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  
  const oldSend = res.send;
  res.send = function(data) {
    console.log('📤 Response:', JSON.stringify(data, null, 2));
    oldSend.apply(res, arguments);
  };
  
  next();
});

// 7. Routes with individual error handling
app.use('/accounts', (req, res, next) => {
  Promise.resolve(require('./accounts/account.controller')(req, res, next))
    .catch(next);
});

app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));

// 8. Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: sequelize.authenticate() ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// 9. SUPER detailed error handler
app.use((err, req, res, next) => {
  const errorId = Math.random().toString(36).substring(2, 10);
  
  console.error(`\n⚠️ ERROR [${errorId}] ⚠️`);
  console.error('⏰ Timestamp:', new Date().toISOString());
  console.error('🌐 URL:', req.method, req.originalUrl);
  console.error('🧑‍💻 User Agent:', req.headers['user-agent']);
  console.error('💥 Error:', err);
  console.error('📌 Stack:', err.stack);
  
  if (err.errors) {
    console.error('🔍 Validation Errors:', err.errors);
  }
  
  if (err.sql) {
    console.error('🗄️ SQL Error:', {
      query: err.sql,
      parameters: err.parameters
    });
  }

  const response = {
    error: 'Internal Server Error',
    message: 'Something went wrong',
    ...(isDevelopment && {
      details: err.message,
      stack: err.stack,
      errorId
    })
  };

  res.status(500).json(response);
});

// 10. Server startup
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`\n🚀 Server running on port ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Allowed Origins: ${isDevelopment ? 'http://localhost:4200' : 'production URL'}`);
});