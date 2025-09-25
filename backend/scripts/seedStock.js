const mongoose = require('mongoose');
const Stock = require('../models/Stock');
require('dotenv').config();

const stockData = [
  {
    pharmacy: '1',
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
    pharmacy: '1',
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
    pharmacy: '1',
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
    pharmacy: '1',
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
    pharmacy: '1',
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
    pharmacy: '1',
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

async function seedStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Stock.deleteMany({ pharmacy: '1' });
    console.log('Cleared existing stock for pharmacy 1');
    
    await Stock.insertMany(stockData);
    console.log('Stock data seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stock:', error);
    process.exit(1);
  }
}

seedStock();