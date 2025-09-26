const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

async function clearPendingOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Order.deleteMany({ status: 'pending' });
    console.log(`Deleted ${result.deletedCount} pending orders`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearPendingOrders();