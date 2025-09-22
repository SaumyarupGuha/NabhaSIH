const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function getUserIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const patients = await User.find({ role: 'patient' }).limit(3);
    const doctors = await User.find({ role: 'doctor' }).limit(3);
    
    console.log('\n=== PATIENT IDs ===');
    patients.forEach(p => console.log(`${p.firstName} ${p.lastName}: ${p._id}`));
    
    console.log('\n=== DOCTOR IDs ===');
    doctors.forEach(d => console.log(`${d.firstName} ${d.lastName}: ${d._id}`));
    
    console.log('\n=== UPDATE SIMULATOR ===');
    console.log('Copy these patient IDs to healthDataSimulator.js:');
    console.log(JSON.stringify(patients.map(p => p._id.toString()), null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getUserIds();