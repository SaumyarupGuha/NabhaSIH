const express = require('express');
const https = require('https');
const router = express.Router();

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Geocoding proxy route
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address parameter required' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const data = await makeRequest(url);
    res.json(data);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Distance Matrix proxy route
router.get('/distance', async (req, res) => {
  try {
    const { origins, destinations } = req.query;
    if (!origins || !destinations) {
      return res.status(400).json({ error: 'Origins and destinations parameters required' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=metric&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const data = await makeRequest(url);
    res.json(data);
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;