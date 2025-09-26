const axios = require('axios');
const verifiedPharmacies = require('../data/verifiedPharmacies');

class DistanceCalculator {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.openRouteServiceKey = process.env.OPENROUTE_SERVICE_KEY; // Free alternative
  }

  // Calculate distance using Haversine formula (fallback)
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate real-time distance and duration using Google Maps or OpenRouteService
  async calculateRealTimeDistance(origins, destinations) {
    // Try Google Maps first
    if (this.googleMapsApiKey) {
      console.log('🗺️  Trying Google Maps API for distance calculation');
      const googleResult = await this.tryGoogleMaps(origins, destinations);
      if (googleResult) return googleResult;
    }
    
    // Try OpenRouteService as fallback
    if (this.openRouteServiceKey) {
      console.log('🌍 Trying OpenRouteService API for distance calculation');
      const orsResult = await this.tryOpenRouteService(origins, destinations);
      if (orsResult) return orsResult;
    }
    
    console.log('⚠️  No working API keys found, using mathematical calculation');
    return this.calculateFallbackDistances(origins, destinations);
  }
  
  async tryGoogleMaps(origins, destinations) {
    try {
      const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
      const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');

      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: originsStr,
          destinations: destinationsStr,
          units: 'metric',
          mode: 'driving',
          traffic_model: 'best_guess',
          departure_time: 'now',
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK') {
        console.log('✅ Google Maps API response successful');
        console.log('📊 Google Maps data:', response.data);
        return this.parseDistanceMatrixResponse(response.data);
      } else {
        console.warn('❌ Google Maps API error:', response.data.status, response.data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Google Maps error:', error.message);
      return null;
    }
  }
  
  async tryOpenRouteService(origins, destinations) {
    try {
      const origin = `${origins[0].lng},${origins[0].lat}`;
      const destination = `${destinations[0].lng},${destinations[0].lat}`;
      
      const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
        params: {
          api_key: this.openRouteServiceKey,
          start: origin,
          end: destination
        }
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const route = response.data.features[0].properties;
        console.log('✅ OpenRouteService API response successful');
        
        return [{
          originIndex: 0,
          destinationIndex: 0,
          distance: route.segments[0].distance / 1000, // Convert to km
          duration: route.segments[0].duration / 60, // Convert to minutes
          durationInTraffic: route.segments[0].duration / 60 // No traffic data, use same
        }];
      }
      
      return null;
    } catch (error) {
      console.error('OpenRouteService error:', error.message);
      return null;
    }
  }

  parseDistanceMatrixResponse(data) {
    const results = [];
    
    data.rows.forEach((row, originIndex) => {
      row.elements.forEach((element, destIndex) => {
        if (element.status === 'OK') {
          results.push({
            originIndex,
            destinationIndex: destIndex,
            distance: element.distance.value / 1000, // Convert to km
            duration: element.duration.value / 60, // Convert to minutes
            durationInTraffic: element.duration_in_traffic ? 
              element.duration_in_traffic.value / 60 : element.duration.value / 60
          });
        }
      });
    });

    return results;
  }

  calculateFallbackDistances(origins, destinations) {
    const results = [];
    
    origins.forEach((origin, originIndex) => {
      destinations.forEach((destination, destIndex) => {
        const distance = this.calculateHaversineDistance(
          origin.lat, origin.lng,
          destination.lat, destination.lng
        );
        
        // Estimate time based on average speed (30 km/h in city)
        const estimatedTime = (distance / 30) * 60; // minutes
        
        results.push({
          originIndex,
          destinationIndex: destIndex,
          distance,
          duration: estimatedTime,
          durationInTraffic: estimatedTime * 1.2 // Add 20% for traffic
        });
      });
    });

    return results;
  }

  // Calculate distance to verified pharmacies
  async calculateDistanceToVerifiedPharmacies(customerCoordinates) {
    try {
      const origins = [customerCoordinates];
      const destinations = verifiedPharmacies.map(p => p.coordinates);
      
      const distances = await this.calculateRealTimeDistance(origins, destinations);
      
      return distances.map((result, index) => ({
        ...result,
        pharmacyId: verifiedPharmacies[index].id,
        pharmacyName: verifiedPharmacies[index].name,
        pharmacyAddress: verifiedPharmacies[index].address,
        pharmacyPhone: verifiedPharmacies[index].phone
      }));
    } catch (error) {
      console.error('Error calculating distances to verified pharmacies:', error);
      throw error;
    }
  }

  // Calculate distance to specific verified pharmacy
  async calculateDistanceToSpecificPharmacy(customerCoordinates, pharmacyName) {
    try {
      const pharmacy = verifiedPharmacies.find(p => p.name === pharmacyName);
      if (!pharmacy) {
        throw new Error('Pharmacy not found in verified list');
      }
      
      const results = await this.calculateRealTimeDistance(
        [customerCoordinates],
        [pharmacy.coordinates]
      );
      
      return results.map(result => ({
        ...result,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        pharmacyAddress: pharmacy.address,
        pharmacyPhone: pharmacy.phone
      }));
    } catch (error) {
      console.error('Error calculating distance to specific pharmacy:', error);
      throw error;
    }
  }

  // Find nearest pharmacies with stock availability
  async findNearestPharmacies(userLocation, pharmacies, requiredMedicines = []) {
    const origins = [userLocation];
    const destinations = pharmacies.map(p => p.coordinates);

    const distances = await this.calculateRealTimeDistance(origins, destinations);
    
    // Combine pharmacy data with distance information
    const pharmaciesWithDistance = pharmacies.map((pharmacy, index) => {
      const distanceData = distances.find(d => d.destinationIndex === index);
      
      return {
        ...pharmacy.toObject(),
        distance: distanceData ? distanceData.distance : null,
        estimatedTime: distanceData ? Math.round(distanceData.durationInTraffic) : null,
        availability: this.checkStockAvailability(pharmacy, requiredMedicines)
      };
    });

    // Sort by distance and availability
    return pharmaciesWithDistance
      .filter(p => p.distance !== null)
      .sort((a, b) => {
        // Prioritize available pharmacies
        if (a.availability === 'available' && b.availability !== 'available') return -1;
        if (b.availability === 'available' && a.availability !== 'available') return 1;
        
        // Then sort by distance
        return a.distance - b.distance;
      });
  }

  checkStockAvailability(pharmacy, requiredMedicines) {
    if (!requiredMedicines || requiredMedicines.length === 0) {
      return 'available';
    }

    // Check if pharmacy has sufficient stock for all required medicines
    const hasAllMedicines = requiredMedicines.every(required => {
      const stock = pharmacy.stock?.find(s => s.medicineId.toString() === required.medicineId);
      return stock && stock.quantity >= required.quantity;
    });

    return hasAllMedicines ? 'available' : 'limited';
  }

  // Calculate delivery zones based on distance
  getDeliveryZone(distance) {
    if (distance <= 2) return { zone: 'express', fee: 0, time: '15-25 min' };
    if (distance <= 5) return { zone: 'standard', fee: 20, time: '25-40 min' };
    if (distance <= 10) return { zone: 'extended', fee: 40, time: '40-60 min' };
    return { zone: 'far', fee: 60, time: '60-90 min' };
  }
}

module.exports = new DistanceCalculator();