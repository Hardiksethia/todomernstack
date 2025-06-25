const express = require('express');
const router = express.Router();
const { aiCommand } = require('../controllers/taskController');
const protect = require('../middlewares/authMiddleware');

router.post('/command', protect, aiCommand);

module.exports = router; 