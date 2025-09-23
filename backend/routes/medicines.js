const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// Search medicines
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    console.log('Searching medicines for:', q);
    
    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    
    console.log('Found medicines:', medicines.length);
    
    res.json({ success: true, data: medicines });
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find({ inStock: true });
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;