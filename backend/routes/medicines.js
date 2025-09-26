const express = require('express');
const Stock = require('../models/Stock');
const router = express.Router();

// Get all available medicines from all pharmacies
router.get('/available', async (req, res) => {
  try {
    // Get all stock items with quantity > 0
    const stockItems = await Stock.find({ 
      quantity: { $gt: 0 },
      isAvailable: true 
    }).sort({ medicineName: 1 });

    // Group by medicine name and aggregate quantities
    const medicineMap = new Map();
    
    stockItems.forEach(item => {
      const key = item.medicineName;
      if (medicineMap.has(key)) {
        const existing = medicineMap.get(key);
        existing.totalQuantity += item.quantity;
        existing.pharmacies.push({
          pharmacyId: item.pharmacy,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });
        // Use the lowest price
        if (item.unitPrice < existing.unitPrice) {
          existing.unitPrice = item.unitPrice;
        }
      } else {
        medicineMap.set(key, {
          _id: item._id,
          name: item.medicineName,
          category: item.category,
          unitPrice: item.unitPrice,
          totalQuantity: item.quantity,
          manufacturer: item.manufacturer,
          expiryDate: item.expiryDate,
          pharmacies: [{
            pharmacyId: item.pharmacy,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }]
        });
      }
    });

    // Convert map to array and format for frontend
    const availableMedicines = Array.from(medicineMap.values()).map(medicine => ({
      _id: medicine._id,
      name: medicine.name,
      price: `₹${medicine.unitPrice}`,
      unitPrice: medicine.unitPrice,
      availability: medicine.totalQuantity > 0 ? 
        (medicine.totalQuantity <= 20 ? "Limited Stock" : "In Stock") : 
        "Out of Stock",
      quantity: medicine.totalQuantity,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      expiryDate: medicine.expiryDate,
      pharmacies: medicine.pharmacies
    }));

    res.json({ 
      success: true, 
      data: availableMedicines,
      count: availableMedicines.length 
    });
  } catch (error) {
    console.error('Error fetching available medicines:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available medicines' 
    });
  }
});

module.exports = router;