const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all pharmacies
router.get('/', auth, async (req, res) => {
  try {
    const pharmacies = await User.find({ 
      role: 'pharmacist', 
      isVerified: true 
    }).select('firstName lastName phone pharmacyName pharmacyAddress village');

    res.json(pharmacies);
  } catch (error) {
    console.error('Get pharmacies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pharmacy by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const pharmacy = await User.findOne({
      _id: req.params.id,
      role: 'pharmacist'
    }).select('firstName lastName phone pharmacyName pharmacyAddress village');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;