const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
require('dotenv').config();

const medicines = [
  {
    name: 'Paracetamol',
    brand: 'Crocin',
    alternatives: ['Dolo 650', 'Calpol', 'Tylenol'],
    stock: 100,
    price: 25,
    dosage: '500mg',
    category: 'Pain Relief'
  },
  {
    name: 'Ibuprofen',
    brand: 'Brufen',
    alternatives: ['Advil', 'Combiflam'],
    stock: 75,
    price: 45,
    dosage: '400mg',
    category: 'Pain Relief'
  },
  {
    name: 'Amoxicillin',
    brand: 'Amoxil',
    alternatives: ['Augmentin', 'Clavam'],
    stock: 50,
    price: 120,
    dosage: '500mg',
    category: 'Antibiotic'
  },
  {
    name: 'Azithromycin',
    brand: 'Azee',
    alternatives: ['Zithromax', 'Azithral'],
    stock: 30,
    price: 180,
    dosage: '250mg',
    category: 'Antibiotic'
  },
  {
    name: 'Cetirizine',
    brand: 'Zyrtec',
    alternatives: ['Cetrizet', 'Alerid'],
    stock: 80,
    price: 35,
    dosage: '10mg',
    category: 'Antihistamine'
  },
  {
    name: 'Omeprazole',
    brand: 'Prilosec',
    alternatives: ['Omez', 'Losec'],
    stock: 60,
    price: 85,
    dosage: '20mg',
    category: 'Antacid'
  },
  {
    name: 'Metformin',
    brand: 'Glucophage',
    alternatives: ['Glycomet', 'Diabex'],
    stock: 40,
    price: 95,
    dosage: '500mg',
    category: 'Diabetes'
  },
  {
    name: 'Aspirin',
    brand: 'Disprin',
    alternatives: ['Ecosprin', 'Loprin'],
    stock: 90,
    price: 15,
    dosage: '75mg',
    category: 'Blood Thinner'
  }
];

async function seedMedicines() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('Cleared existing medicines');

    // Insert new medicines
    await Medicine.insertMany(medicines);
    console.log('Seeded medicines successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding medicines:', error);
    process.exit(1);
  }
}

seedMedicines();