const express = require('express');
const router = express.Router();

// Calculate distance between two addresses
router.post('/calculate', async (req, res) => {
  try {
    const { fromAddress, toAddress, fromCoords, toCoords } = req.body;
    
    console.log(`🗺️ Calculating distance from: ${fromAddress} to: ${toAddress}`);
    
    const distanceCalculator = require('../services/distanceCalculator');
    
    // Use provided coordinates or geocode addresses
    let originCoords = fromCoords;
    let destinationCoords = toCoords;
    
    // If coordinates not provided, use fallback locations
    if (!originCoords) {
      originCoords = { lat: 30.1644, lng: 76.1436 }; // Default user location
    }
    
    if (!destinationCoords) {
      destinationCoords = { lat: 30.3752, lng: 76.1496 }; // Default pharmacy location
    }
    
    console.log('📍 Origin coordinates:', originCoords);
    console.log('📍 Destination coordinates:', destinationCoords);
    
    const distanceResults = await distanceCalculator.calculateRealTimeDistance(
      [originCoords],
      [destinationCoords]
    );
    
    if (distanceResults.length > 0) {
      const result = distanceResults[0];
      const distance = result.distance?.toFixed(2) || 'N/A';
      const duration = Math.round(result.durationInTraffic) || Math.round(result.duration) || 'N/A';
      
      console.log(`📍 Distance calculation: ${distance}km, ${duration}min`);
      
      res.json({
        success: true,
        data: {
          distance: parseFloat(distance),
          duration: duration,
          estimatedDeliveryTime: `${duration} min`,
          fromAddress,
          toAddress
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unable to calculate distance'
      });
    }
    
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate distance'
    });
  }
});

module.exports = router;