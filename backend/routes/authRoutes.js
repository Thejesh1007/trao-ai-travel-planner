const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register → calls register function
router.post('/register', register);

// POST /api/auth/login → calls login function
router.post('/login', login);

module.exports = router;