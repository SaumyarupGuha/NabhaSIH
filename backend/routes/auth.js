const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor', 'pharmacist']).withMessage('Invalid role'),
  body('village').notEmpty().withMessage('Village is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password, role, village, age, gender, license, specialization, hospital, pharmacyName, pharmacyAddress } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ phone }, ...(email ? [{ email }] : [])]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone or email' });
    }

    // Create user
    const userData = {
      firstName,
      lastName,
      phone,
      password,
      role,
      village
    };

    if (email) userData.email = email;
    if (role === 'patient') {
      userData.age = age;
      userData.gender = gender;
    } else if (role === 'doctor') {
      userData.license = license;
      userData.specialization = specialization;
      userData.hospital = hospital;
    } else if (role === 'pharmacist') {
      userData.pharmacyName = pharmacyName;
      userData.pharmacyAddress = pharmacyAddress;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('contact').notEmpty().withMessage('Phone or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['patient', 'doctor', 'pharmacist', 'admin']).withMessage('Role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact, password, role } = req.body;

    // Find user by phone or email
    const user = await User.findOne({
      $and: [
        { role },
        {
          $or: [
            { phone: contact },
            { email: contact }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      village: req.user.village,
      isVerified: req.user.isVerified
    }
  });
});

module.exports = router;