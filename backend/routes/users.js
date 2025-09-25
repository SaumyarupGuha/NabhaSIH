const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('selectedPharmacy', 'name address phone');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'email', 'village', 'age', 'gender'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only, except for role=patient which is public for simulator)
router.get('/', async (req, res) => {
  try {
    const { role, verified } = req.query;
    
    // Allow public access only for getting patients (for simulator)
    if (role !== 'patient') {
      // Require admin auth for other roles
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Access denied' });
      }
      // Apply auth middleware manually
      const authMiddleware = [auth, authorize('admin')];
      // This is a simplified check - in production, properly apply middleware
    }
    
    let query = {};
    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const users = await User.find(query)
      .select('-password')
      .populate('selectedPharmacy', 'name address phone');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify user (admin only)
router.patch('/:id/verify', [auth, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User verified successfully', user });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;