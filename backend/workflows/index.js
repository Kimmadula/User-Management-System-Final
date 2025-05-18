const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Workflows endpoint working!" });
});

module.exports = router;