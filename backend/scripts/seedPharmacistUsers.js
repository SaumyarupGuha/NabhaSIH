const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const pharmacistUsers = [
  {
    firstName: 'Happy',
    lastName: 'Singh',
    email: 'happy@punjabmedical.com',
    phone: '+91 9554776382',
    password: 'password123',
    role: 'pharmacist',
    village: 'Nabha',
    selectedPharmacy: 'punjab_medical_store',
    isVerified: true
  },
  {
    firstName: 'Harjit',
    lastName: 'Singh', 
    email: 'harjit@munishmedhall.com',
    phone: '+91 9554776384',
    password: 'password123',
    role: 'pharmacist',
    village: 'Nabha',
    selectedPharmacy: 'munish_med_hall',
    isVerified: true
  },
  {
    firstName: 'Maninder',
    lastName: 'Singh',
    email: 'maninder@munishmedicos.com',
    phone: '+91 9554776385',
    password: 'password123',
    role: 'pharmacist',
    village: 'Nabha',
    selectedPharmacy: 'munish_medicos',
    isVerified: true
  }
];

async function seedPharmacistUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Remove existing pharmacist users
    await User.deleteMany({ role: 'pharmacist' });
    console.log('Cleared existing pharmacist users');
    
    // Insert new pharmacist users
    await User.insertMany(pharmacistUsers);
    console.log('Pharmacist users seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pharmacist users:', error);
    process.exit(1);
  }
}

seedPharmacistUsers();