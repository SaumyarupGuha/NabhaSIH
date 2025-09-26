const https = require('https');
const fs = require('fs');

// Read API key from .env file
const envContent = fs.readFileSync('./backend/.env', 'utf8');
const apiKeyMatch = envContent.match(/GOOGLE_MAPS_API_KEY=(.+)/);
const GOOGLE_MAPS_API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

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
        console.error('❌ Google Maps API key not found in .env file');
        return;
    }

    try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Nabha,Punjab,India&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await makeRequest(geocodeUrl);

        if (response.status === 'OK') {
            console.log('✅ Google Maps API: Working');
            console.log('Location:', response.results[0].formatted_address);
            console.log('Coordinates:', response.results[0].geometry.location);
        } else {
            console.log('❌ API Error:', response.status);
            console.log('Error message:', response.error_message || 'No error message');
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testGoogleMapsAPI();