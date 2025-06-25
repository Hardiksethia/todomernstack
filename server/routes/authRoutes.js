const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

const User = require('../models/User'); 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put('/update', protect, updateUserProfile);




module.exports = router;