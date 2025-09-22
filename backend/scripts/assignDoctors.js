const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function assignDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const doctors = await User.find({ role: 'doctor' });
    const patients = await User.find({ role: 'patient' });
    
    console.log(`Found ${doctors.length} doctors and ${patients.length} patients`);
    
    // Assign each patient to a doctor (round-robin)
    for (let i = 0; i < patients.length; i++) {
      const doctorIndex = i % doctors.length;
      const assignedDoctor = doctors[doctorIndex];
      
      await User.findByIdAndUpdate(patients[i]._id, {
        assignedDoctor: assignedDoctor._id
      });
      
      console.log(`Assigned ${patients[i].firstName} ${patients[i].lastName} to Dr. ${assignedDoctor.firstName} ${assignedDoctor.lastName}`);
    }
    
    console.log('✅ Assigned all patients to doctors');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignDoctors();