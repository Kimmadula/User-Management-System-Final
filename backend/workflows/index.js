// workflows/index.js
const express = require('express');
const router = express.Router();
const controller = require('./workflow.controller');

// Public health check endpoint
router.get('/healthcheck', (req, res) => {
  res.json({ 
    status: 'Workflow service active',
    timestamp: new Date() 
  });
});

// Mount all controller routes
router.use('/', controller);

module.exports = router;