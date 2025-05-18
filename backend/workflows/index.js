const express = require('express');
const router = express.Router();
const workflowController = require('./workflow.controller');

router.get('/', (req, res) => {
  res.json({ message: "Workflows endpoint working!" });
});

module.exports = router;

// Forward all workflow routes to the workflow controller
router.use('/', workflowController);

module.exports = router;
