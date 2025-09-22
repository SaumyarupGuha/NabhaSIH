const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function assignToJeramiah() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find Dr. Jeramiah Granger
    const jeramiah = await User.findOne({ 
      $or: [
        { firstName: { $regex: /jeramiah/i } },
        { firstName: { $regex: /jeremiah/i } }
      ]
    });
    
    if (!jeramiah) {
      console.log('Dr. Jeramiah not found');
      process.exit(1);
    }
    
    console.log(`Found: ${jeramiah.firstName} ${jeramiah.lastName} (${jeramiah._id})`);
    
    // Assign all patients to Dr. Jeramiah
    const result = await User.updateMany(
      { role: 'patient' },
      { $set: { assignedDoctor: jeramiah._id } }
    );
    
    console.log(`✅ Assigned ${result.modifiedCount} patients to Dr. ${jeramiah.firstName} ${jeramiah.lastName}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignToJeramiah();