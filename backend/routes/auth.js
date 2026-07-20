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
router.post('/register', async (req, res) => {
  try {
    console.log('Registration data:', req.body);
    const { firstName, lastName, email, phone, password, role, village, age, gender, license, specialization, hospital, consultationFee, availableDays, selectedPharmacy } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ phone }, ...(email ? [{ email }] : [])]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone or email' });
    }

    // Additional validation for pharmacist role
    if (role === 'pharmacist') {
      if (!selectedPharmacy) {
        return res.status(400).json({ message: 'Pharmacy selection is required for pharmacist registration' });
      }
      
      if (!license) {
        return res.status(400).json({ message: 'Pharmacy license is required for pharmacist registration' });
      }
      
      // Check if pharmacy already has a pharmacist
      const existingPharmacist = await User.findOne({ 
        role: 'pharmacist', 
        selectedPharmacy: selectedPharmacy,
        isVerified: true 
      });
      
      if (existingPharmacist) {
        return res.status(400).json({ 
          message: 'This pharmacy already has a registered pharmacist. Only one pharmacist per pharmacy is allowed.' 
        });
      }
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
      userData.consultationFee = consultationFee;
      userData.availableDays = availableDays || [];
    } else if (role === 'pharmacist') {
      userData.selectedPharmacy = selectedPharmacy;
      userData.license = license;
      userData.isVerified = false; // Pharmacists need admin approval
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