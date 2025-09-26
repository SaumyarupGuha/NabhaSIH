const express = require('express');
const router = express.Router();

// Simulate pharmacy rating update
router.post('/rating/:pharmacyId', (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { rating, pharmacyName } = req.body;
    
    // Emit real-time rating update
    if (req.io) {
      req.io.emit('pharmacyRatingUpdate', {
        pharmacyId,
        pharmacyName: pharmacyName || 'Pharmacy',
        rating: parseFloat(rating).toFixed(1)
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Rating updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update rating' 
    });
  }
});

// Simulate pharmacy status update
router.post('/status/:pharmacyId', (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { isOpen, pharmacyName } = req.body;
    
    // Emit real-time status update
    if (req.io) {
      req.io.emit('pharmacyStatusUpdate', {
        pharmacyId,
        pharmacyName: pharmacyName || 'Pharmacy',
        isOpen: Boolean(isOpen)
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Status updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status' 
    });
  }
});

module.exports = router;