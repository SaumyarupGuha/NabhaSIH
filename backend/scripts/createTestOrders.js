const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

const testOrders = [
  {
    orderNumber: 'ORD001',
    orderType: 'patient',
    orderedBy: '507f1f77bcf86cd799439011', // dummy ObjectId
    assignedPharmacy: '1',
    items: [
      {
        medicineName: 'Paracetamol 500mg',
        quantity: 2,
        unitPrice: 2.50,
        totalPrice: 5.00
      }
    ],
    totalAmount: 5.00,
    deliveryType: 'delivery',
    deliveryAddress: '123 Main St, Nabha',
    customerInfo: {
      name: 'John Doe',
      phone: '+919876543210',
      address: '123 Main St, Nabha'
    },
    priority: 'medium',
    status: 'assigned'
  },
  {
    orderNumber: 'ORD002',
    orderType: 'patient',
    orderedBy: '507f1f77bcf86cd799439012',
    assignedPharmacy: '1',
    items: [
      {
        medicineName: 'Amoxicillin 250mg',
        quantity: 1,
        unitPrice: 8.00,
        totalPrice: 8.00
      },
      {
        medicineName: 'Cough Syrup',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00
      }
    ],
    totalAmount: 53.00,
    deliveryType: 'pickup',
    customerInfo: {
      name: 'Jane Smith',
      phone: '+919876543211',
      address: 'Pharmacy Pickup'
    },
    priority: 'high',
    status: 'assigned'
  }
];

async function createTestOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing test orders
    await Order.deleteMany({ orderNumber: { $in: ['ORD001', 'ORD002'] } });
    console.log('Cleared existing test orders');
    
    // Create new test orders
    await Order.insertMany(testOrders);
    console.log('Test orders created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test orders:', error);
    process.exit(1);
  }
}

createTestOrders();