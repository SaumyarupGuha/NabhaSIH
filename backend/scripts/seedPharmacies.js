const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');
require('dotenv').config();

const pharmacies = [
  {
    name: 'Central Pharmacy',
    address: 'Main Market, Nabha, Punjab 147201',
    phone: '+91 98765 43210',
    coordinates: { lat: 30.7046, lng: 76.1512 },
    hours: '8:00 AM - 10:00 PM',
    services: ['Prescription Medicines', 'OTC Drugs', 'Health Checkup', 'Home Delivery'],
    rating: 4.5,
    isOpen24Hours: false,
    status: 'Open'
  },
  {
    name: 'City Pharmacy',
    address: 'Civil Lines, Nabha, Punjab 147201',
    phone: '+91 98765 43211',
    coordinates: { lat: 30.7056, lng: 76.1522 },
    hours: '9:00 AM - 9:00 PM',
    services: ['Prescription Medicines', 'Medical Equipment', 'Home Delivery'],
    rating: 4.2,
    isOpen24Hours: false,
    status: 'Open'
  },
  {
    name: 'Medical Store',
    address: 'Bus Stand Road, Nabha, Punjab 147201',
    phone: '+91 98765 43212',
    coordinates: { lat: 30.7036, lng: 76.1502 },
    hours: '7:00 AM - 11:00 PM',
    services: ['Prescription Medicines', 'OTC Drugs', 'Emergency Medicines'],
    rating: 4.0,
    isOpen24Hours: false,
    status: 'Open'
  },
  {
    name: 'Health Plus Pharmacy',
    address: 'Model Town, Nabha, Punjab 147201',
    phone: '+91 98765 43213',
    coordinates: { lat: 30.7066, lng: 76.1532 },
    hours: '24 Hours',
    services: ['Prescription Medicines', 'OTC Drugs', 'Health Checkup', 'Home Delivery', '24/7 Service'],
    rating: 4.8,
    isOpen24Hours: true,
    status: 'Open'
  },
  {
    name: 'Care Pharmacy',
    address: 'Railway Road, Nabha, Punjab 147201',
    phone: '+91 98765 43214',
    coordinates: { lat: 30.7026, lng: 76.1492 },
    hours: '8:00 AM - 8:00 PM',
    services: ['Prescription Medicines', 'Ayurvedic Medicines', 'Home Delivery'],
    rating: 4.3,
    isOpen24Hours: false,
    status: 'Open'
  }
];

async function seedPharmacies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Pharmacy.deleteMany({});
    console.log('Cleared existing pharmacies');
    
    await Pharmacy.insertMany(pharmacies);
    console.log('Pharmacies seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pharmacies:', error);
    process.exit(1);
  }
}

seedPharmacies();