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
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor', 'pharmacist']).withMessage('Invalid role'),
  body('village').notEmpty().withMessage('Village is required'),
  // Conditional validations
  body('age').if(body('role').equals('patient')).isInt({ min: 1, max: 120 }).withMessage('Valid age is required for patients'),
  body('gender').if(body('role').equals('patient')).isIn(['male', 'female', 'other']).withMessage('Valid gender is required for patients'),
  body('license').if(body('role').equals('doctor')).notEmpty().withMessage('Medical license is required for doctors'),
  body('specialization').if(body('role').equals('doctor')).notEmpty().withMessage('Specialization is required for doctors'),
  body('hospital').if(body('role').equals('doctor')).notEmpty().withMessage('Hospital/clinic is required for doctors'),
  body('consultationFee').if(body('role').equals('doctor')).isFloat({ min: 0 }).withMessage('Valid consultation fee is required for doctors'),
  body('availableDays').if(body('role').equals('doctor')).isArray({ min: 1 }).withMessage('At least one available day is required for doctors'),
  body('pharmacyName').if(body('role').equals('pharmacist')).notEmpty().withMessage('Pharmacy name is required for pharmacists'),
  body('pharmacyAddress').if(body('role').equals('pharmacist')).notEmpty().withMessage('Pharmacy address is required for pharmacists')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ message: errorMessage, errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password, role, village, age, gender, license, specialization, hospital, availableDays, consultationFee, pharmacyName, pharmacyAddress } = req.body;

    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, ''); // Remove non-digits
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { phone: normalizedPhone },
        { phone: phone },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number or email' });
    }

    // Create user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizedPhone,
      password,
      role,
      village
    };

    if (email && email.trim()) {
      userData.email = email.toLowerCase().trim();
    }
    
    if (role === 'patient') {
      userData.age = parseInt(age);
      userData.gender = gender;
    } else if (role === 'doctor') {
      userData.license = license.trim();
      userData.specialization = specialization.trim();
      userData.hospital = hospital.trim();
      userData.availableDays = availableDays;
      userData.consultationFee = parseFloat(consultationFee);
    } else if (role === 'pharmacist') {
      userData.pharmacyName = pharmacyName.trim();
      userData.pharmacyAddress = pharmacyAddress.trim();
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
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: validationErrors.join(', '),
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'phone' ? 'Phone number' : field} already exists`
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
        _id: user._id,
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

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
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