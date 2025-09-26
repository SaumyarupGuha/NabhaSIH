const express = require('express');
const router = express.Router();
const verifiedPharmacies = require('../data/verifiedPharmacies');

// Get all verified pharmacies
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: verifiedPharmacies
  });
});

// Get pharmacy by ID
router.get('/:id', (req, res) => {
  const pharmacy = verifiedPharmacies.find(p => p.id === req.params.id);
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
});

// Get registered pharmacy names
router.get('/registered', async (req, res) => {
  try {
    const User = require('../models/User');
    const registeredUsers = await User.find({ role: 'pharmacist' });
    console.log('Found pharmacist users:', registeredUsers.length);
    
    const registeredNames = registeredUsers.map(u => {
      console.log('User selectedPharmacy:', u.selectedPharmacy);
      return u.selectedPharmacy;
    }).filter(Boolean);
    
    console.log('Registered pharmacy names:', registeredNames);
    
    res.json({
      success: true,
      data: registeredNames
    });
  } catch (error) {
    console.error('Error fetching registered pharmacies:', error);
    res.json({
      success: true,
      data: []
    });
  }
});

// Validate pharmacy exists
router.post('/validate', (req, res) => {
  const { name, address } = req.body;
  const pharmacy = verifiedPharmacies.find(p => 
    p.name.toLowerCase() === name.toLowerCase() &&
    p.address.toLowerCase().includes(address.toLowerCase().substring(0, 20))
  );
  
  res.json({
    success: !!pharmacy,
    data: pharmacy || null,
    message: pharmacy ? 'Pharmacy verified' : 'Pharmacy not in verified list'
  });
});

module.exports = router;