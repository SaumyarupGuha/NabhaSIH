const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const router = express.Router();

// Get verified pharmacies for signup dropdown
router.get('/verified', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ 
      isVerified: true,
      isActive: true 
    }).select('name address area city licenseNumber coordinates');

    res.json({
      success: true,
      data: pharmacies
    });
  } catch (error) {
    console.error('Error fetching verified pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacies'
    });
  }
});

// Pharmacy signup
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      contactPerson, 
      phone, 
      pharmacyId, 
      workingHours,
      role = 'pharmacist'
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify pharmacy exists and is verified
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || !pharmacy.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unverified pharmacy selected'
      });
    }

    // Check if pharmacy already has a registered user
    const existingPharmacyUser = await User.findOne({ 
      pharmacyId: pharmacyId,
      role: 'pharmacist'
    });
    
    if (existingPharmacyUser) {
      return res.status(400).json({
        success: false,
        message: 'This pharmacy already has a registered account'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: contactPerson,
      email,
      password: hashedPassword,
      phone,
      role,
      pharmacyId,
      workingHours,
      isVerified: true // Auto-verify since pharmacy is pre-verified
    });

    await user.save();

    // Update pharmacy with user reference
    await Pharmacy.findByIdAndUpdate(pharmacyId, {
      userId: user._id,
      contactPerson,
      contactPhone: phone,
      workingHours,
      lastUpdated: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        pharmacyId: user.pharmacyId
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Pharmacy account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          pharmacyId: user.pharmacyId
        },
        pharmacy: {
          id: pharmacy._id,
          name: pharmacy.name,
          address: pharmacy.address
        },
        token
      }
    });

  } catch (error) {
    console.error('Pharmacy signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

// Update pharmacy availability
router.patch('/availability', async (req, res) => {
  try {
    const { pharmacyId, isOpen, workingHours, deliveryCapacity } = req.body;
    
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      pharmacyId,
      {
        isOpen,
        workingHours,
        deliveryCapacity,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: pharmacy
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
});

// Get pharmacy profile
router.get('/profile/:pharmacyId', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.pharmacyId)
      .populate('userId', 'name email phone workingHours');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.json({
      success: true,
      data: pharmacy
    });

  } catch (error) {
    console.error('Error fetching pharmacy profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacy profile'
    });
  }
});

module.exports = router;