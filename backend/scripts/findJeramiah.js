const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function findJeramiah() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const jeramiah = await User.findOne({ 
      firstName: { $regex: /jeramiah/i },
      lastName: { $regex: /granger/i }
    });
    
    if (jeramiah) {
      console.log(`Found: ${jeramiah.firstName} ${jeramiah.lastName}`);
      console.log(`ID: ${jeramiah._id}`);
      console.log(`Role: ${jeramiah.role}`);
    } else {
      console.log('Dr. Jeramiah Granger not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findJeramiah();