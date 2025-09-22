const mongoose = require('mongoose');
const Stock = require('../models/Stock');

mongoose.connect('mongodb://localhost:27017/nabha-health');

const dummyStock = [
  {
    pharmacy: '674a1b2c3d4e5f6789012345', // Mock pharmacy ID
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
    pharmacy: '674a1b2c3d4e5f6789012345',
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
    pharmacy: '674a1b2c3d4e5f6789012345',
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
    pharmacy: '674a1b2c3d4e5f6789012345',
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
    pharmacy: '674a1b2c3d4e5f6789012345',
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
    pharmacy: '674a1b2c3d4e5f6789012345',
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
    pharmacy: '674a1b2c3d4e5f6789012345',
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
    pharmacy: '674a1b2c3d4e5f6789012345',
    medicineName: 'Aspirin 75mg',
    category: 'tablet',
    quantity: 5, // Low stock
    unitPrice: 1.50,
    expiryDate: new Date('2025-11-30'),
    batchNumber: 'ASP008',
    manufacturer: 'Bayer',
    minStockLevel: 20,
    isAvailable: true
  }
];

async function addDummyStock() {
  try {
    await Stock.insertMany(dummyStock);
    console.log('Dummy stock added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding dummy stock:', error);
    process.exit(1);
  }
}

addDummyStock();