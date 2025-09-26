const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// Get stock for pharmacy
router.get('/pharmacy/:pharmacyId', async (req, res) => {
  try {
    const stock = await Stock.find({ pharmacy: req.params.pharmacyId }).sort({ medicineName: 1 });
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

// Reduce stock after order
router.post('/reduce', async (req, res) => {
  try {
    const { items, pharmacyId } = req.body;
    
    for (const item of items) {
      await Stock.findOneAndUpdate(
        { 
          pharmacy: pharmacyId,
          medicineName: item.medicineName 
        },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }
    
    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;