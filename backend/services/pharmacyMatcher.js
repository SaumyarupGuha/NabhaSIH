const Pharmacy = require('../models/Pharmacy');
const Stock = require('../models/Stock');

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function findOptimalPharmacy(orderItems, customerCoordinates, orderType = 'patient') {
  try {
    // Use dummy pharmacy data since DB might not be connected
    const dummyPharmacies = [
      {
        _id: '674a1b2c3d4e5f6789012345',
        name: 'King Pharmacy',
        rating: 4.7,
        isOpen24Hours: true
      }
    ];

    // Dummy stock for matching
    const dummyStock = [
      'Paracetamol 500mg', 'Amoxicillin 250mg', 'Cough Syrup', 'Insulin Injection',
      'Antiseptic Cream', 'Eye Drops', 'Vitamin D3', 'Aspirin 75mg'
    ];

    const pharmacyScores = [];

    for (const pharmacy of dummyPharmacies) {
      // Check if all items are available in dummy stock
      const stockCheck = orderItems.map(item => {
        const available = dummyStock.includes(item.medicineName);
        return { ...item, available };
      });

      const allItemsAvailable = stockCheck.every(item => item.available);
      if (!allItemsAvailable) continue;

      const distance = calculateDistance(
        customerCoordinates.lat,
        customerCoordinates.lng,
        30.7046, // Nabha coordinates
        76.1512
      );

      const score = {
        pharmacy,
        distance,
        rating: pharmacy.rating || 4.0,
        stockItems: stockCheck,
        totalScore: (pharmacy.rating * 0.3) + ((10 - Math.min(distance, 10)) * 0.7)
      };

      pharmacyScores.push(score);
    }

    pharmacyScores.sort((a, b) => b.totalScore - a.totalScore);
    return pharmacyScores.length > 0 ? pharmacyScores[0] : null;

  } catch (error) {
    console.error('Error finding optimal pharmacy:', error);
    return null;
  }
}

async function updateStock(pharmacyId, orderItems) {
  try {
    for (const item of orderItems) {
      await Stock.findOneAndUpdate(
        { pharmacy: pharmacyId, medicineName: item.medicineName },
        { $inc: { quantity: -item.quantity } }
      );
    }
    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
}

module.exports = { findOptimalPharmacy, updateStock, calculateDistance };