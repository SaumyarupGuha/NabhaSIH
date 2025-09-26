const express = require('express');
const { getAlternatives } = require('../data/medicineAlternatives');
const router = express.Router();

// Get alternatives for a medicine
router.get('/:medicineName', async (req, res) => {
  try {
    const { medicineName } = req.params;
    
    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required'
      });
    }

    // Get alternatives from local database
    const localAlternatives = getAlternatives(medicineName);
    
    // Try to get additional info from OpenFDA API (free, no key needed)
    let fdaAlternatives = [];
    try {
      const fdaResponse = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(medicineName)}"&limit=5`
      );
      
      if (fdaResponse.ok) {
        const fdaData = await fdaResponse.json();
        if (fdaData.results) {
          fdaAlternatives = fdaData.results
            .map(drug => drug.openfda?.brand_name?.[0])
            .filter(name => name && name.toLowerCase() !== medicineName.toLowerCase())
            .slice(0, 3);
        }
      }
    } catch (error) {
      console.log('FDA API not available:', error.message);
    }

    // Combine and deduplicate alternatives
    const allAlternatives = [...new Set([...localAlternatives, ...fdaAlternatives])];
    
    res.json({
      success: true,
      data: {
        medicine: medicineName,
        alternatives: allAlternatives,
        source: localAlternatives.length > 0 ? 'local_database' : 'fda_api'
      }
    });

  } catch (error) {
    console.error('Error getting alternatives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alternatives'
    });
  }
});

module.exports = router;