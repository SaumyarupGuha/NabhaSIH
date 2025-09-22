const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// Get stock for pharmacy
router.get('/pharmacy/:pharmacyId', async (req, res) => {
  try {
    let stock = await Stock.find({ pharmacy: req.params.pharmacyId }).sort({ medicineName: 1 });
    
    // If no stock found, return dummy data
    if (stock.length === 0) {
      stock = [
        {
          _id: '1',
          medicineName: 'Paracetamol 500mg',
          category: 'tablet',
          quantity: 100,
          unitPrice: 2.50,
          expiryDate: new Date('2025-12-31'),
          batchNumber: 'PCM001',
          manufacturer: 'Sun Pharma',
          minStockLevel: 20,
          isAvailable: true
        },
        {
          _id: '2',
          medicineName: 'Amoxicillin 250mg',
          category: 'capsule',
          quantity: 50,
          unitPrice: 8.00,
          expiryDate: new Date('2025-08-15'),
          batchNumber: 'AMX002',
          manufacturer: 'Cipla',
          minStockLevel: 15,
          isAvailable: true
        },
        {
          _id: '3',
          medicineName: 'Cough Syrup',
          category: 'syrup',
          quantity: 25,
          unitPrice: 45.00,
          expiryDate: new Date('2025-06-30'),
          batchNumber: 'CS003',
          manufacturer: 'Dabur',
          minStockLevel: 10,
          isAvailable: true
        },
        {
          _id: '4',
          medicineName: 'Insulin Injection',
          category: 'injection',
          quantity: 15,
          unitPrice: 120.00,
          expiryDate: new Date('2025-03-20'),
          batchNumber: 'INS004',
          manufacturer: 'Novo Nordisk',
          minStockLevel: 5,
          isAvailable: true
        },
        {
          _id: '5',
          medicineName: 'Antiseptic Cream',
          category: 'ointment',
          quantity: 30,
          unitPrice: 25.00,
          expiryDate: new Date('2026-01-15'),
          batchNumber: 'AC005',
          manufacturer: 'Johnson & Johnson',
          minStockLevel: 8,
          isAvailable: true
        },
        {
          _id: '6',
          medicineName: 'Eye Drops',
          category: 'drops',
          quantity: 40,
          unitPrice: 35.00,
          expiryDate: new Date('2025-09-10'),
          batchNumber: 'ED006',
          manufacturer: 'Allergan',
          minStockLevel: 12,
          isAvailable: true
        },
        {
          _id: '7',
          medicineName: 'Vitamin D3',
          category: 'tablet',
          quantity: 80,
          unitPrice: 5.00,
          expiryDate: new Date('2026-05-25'),
          batchNumber: 'VD007',
          manufacturer: 'Ranbaxy',
          minStockLevel: 25,
          isAvailable: true
        },
        {
          _id: '8',
          medicineName: 'Aspirin 75mg',
          category: 'tablet',
          quantity: 5,
          unitPrice: 1.50,
          expiryDate: new Date('2025-11-30'),
          batchNumber: 'ASP008',
          manufacturer: 'Bayer',
          minStockLevel: 20,
          isAvailable: true
        }
      ];
    }
    
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add/Update stock
router.post('/', async (req, res) => {
  try {
    const { pharmacy, medicineName, category, quantity, unitPrice, expiryDate, batchNumber, manufacturer } = req.body;
    
    const existingStock = await Stock.findOne({ pharmacy, medicineName });
    
    if (existingStock) {
      existingStock.quantity += quantity;
      existingStock.unitPrice = unitPrice;
      existingStock.expiryDate = expiryDate;
      existingStock.batchNumber = batchNumber;
      existingStock.manufacturer = manufacturer;
      await existingStock.save();
      res.json({ success: true, data: existingStock });
    } else {
      const newStock = new Stock({
        pharmacy,
        medicineName,
        category,
        quantity,
        unitPrice,
        expiryDate,
        batchNumber,
        manufacturer
      });
      await newStock.save();
      res.json({ success: true, data: newStock });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update stock quantity
router.patch('/:stockId', async (req, res) => {
  try {
    const { quantity, unitPrice, isAvailable } = req.body;
    
    const stock = await Stock.findByIdAndUpdate(
      req.params.stockId,
      { quantity, unitPrice, isAvailable },
      { new: true }
    );
    
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete stock item
router.delete('/:stockId', async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.stockId);
    res.json({ success: true, message: 'Stock item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;