const https = require('https');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

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

async function testGoogleMapsAPI() {
    console.log('Testing Google Maps API Key...');
    console.log('API Key:', GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'Not found');
    
    if (!GOOGLE_MAPS_API_KEY) {
        console.error('❌ Google Maps API key not found in environment variables');
        return;
    }

    try {
        // Test Geocoding API
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Nabha,Punjab,India&key=${GOOGLE_MAPS_API_KEY}`;
        const geocodeResponse = await makeRequest(geocodeUrl);

        if (geocodeResponse.status === 'OK') {
            console.log('✅ Geocoding API: Working');
            console.log('Location:', geocodeResponse.results[0].formatted_address);
        } else {
            console.log('❌ Geocoding API Error:', geocodeResponse.status);
            console.log('Error message:', geocodeResponse.error_message || 'No error message');
        }

    } catch (error) {
        console.error('❌ API Request failed:', error.message);
    }
}

testGoogleMapsAPI();