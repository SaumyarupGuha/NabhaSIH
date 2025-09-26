const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const User = require('../models/User');
require('dotenv').config();

const medicines = [
  { name: 'Paracetamol 500mg', category: 'tablet', price: 2.50, manufacturer: 'Sun Pharma' },
  { name: 'Amoxicillin 250mg', category: 'capsule', price: 8.00, manufacturer: 'Cipla' },
  { name: 'Cough Syrup', category: 'syrup', price: 45.00, manufacturer: 'Dabur' },
  { name: 'Insulin Injection', category: 'injection', price: 120.00, manufacturer: 'Novo Nordisk' },
  { name: 'Antiseptic Cream', category: 'ointment', price: 25.00, manufacturer: 'Johnson & Johnson' },
  { name: 'Eye Drops', category: 'drops', price: 35.00, manufacturer: 'Allergan' },
  { name: 'Vitamin D3', category: 'tablet', price: 5.00, manufacturer: 'Ranbaxy' },
  { name: 'Aspirin 75mg', category: 'tablet', price: 1.50, manufacturer: 'Bayer' },
  { name: 'Ibuprofen 400mg', category: 'tablet', price: 3.00, manufacturer: 'GSK' },
  { name: 'Cetirizine 10mg', category: 'tablet', price: 2.00, manufacturer: 'Dr. Reddy\'s' }
];

async function seedRealStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing stock
    await Stock.deleteMany({});
    console.log('Cleared existing stock');

    // Get all pharmacists
    const pharmacists = await User.find({ role: 'pharmacist' });
    console.log(`Found ${pharmacists.length} pharmacists`);

    for (const pharmacist of pharmacists) {
      const pharmacyId = pharmacist._id.toString();
      
      for (const medicine of medicines) {
        const stock = new Stock({
          pharmacy: pharmacyId,
          medicineName: medicine.name,
          category: medicine.category,
          quantity: Math.floor(Math.random() * 100) + 20, // 20-120 quantity
          unitPrice: medicine.price,
          expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 + 180 * 24 * 60 * 60 * 1000), // 6 months to 1.5 years
          batchNumber: `${medicine.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
          manufacturer: medicine.manufacturer,
          minStockLevel: Math.floor(Math.random() * 15) + 5, // 5-20 min stock
          isAvailable: true
        });
        
        await stock.save();
      }
      
      console.log(`Created stock for pharmacy: ${pharmacist.selectedPharmacy || pharmacist.pharmacyName || pharmacist.phone}`);
    }

    console.log('✅ Stock seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stock:', error);
    process.exit(1);
  }
}

seedRealStock();