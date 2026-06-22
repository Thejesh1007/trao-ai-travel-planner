const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function: creates a signed JWT token for a given user ID
// We call this after both register and login succeed
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload: what we store inside the token
    process.env.JWT_SECRET,   // secret key to sign with
    { expiresIn: '7d' }       // token expires in 7 days
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 3. Hash the password before saving
    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 means it runs the hashing algorithm 2^10 = 1024 times
    // This makes it very hard to reverse even if someone gets the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // store hash, NEVER plain text
    });

    // 5. Generate token and respond
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use a vague message — don't tell attackers whether email exists
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Compare submitted password with stored hash
    // bcrypt.compare() hashes the submitted password the same way and compares
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Generate token and respond
    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { register, login };