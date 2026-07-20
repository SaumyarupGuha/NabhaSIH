const mongoose = require('mongoose');
const Stock = require('./models/Stock');
require('dotenv').config();

const medicines = [
  { name: 'Paracetamol', category: 'tablet', price: 2 },
  { name: 'Ibuprofen', category: 'tablet', price: 5 },
  { name: 'Amoxicillin', category: 'capsule', price: 8 },
  { name: 'Cough Syrup', category: 'syrup', price: 15 },
  { name: 'Aspirin', category: 'tablet', price: 3 },
  { name: 'Vitamin D', category: 'tablet', price: 12 },
  { name: 'Iron Tablets', category: 'tablet', price: 6 },
  { name: 'Antiseptic Cream', category: 'ointment', price: 25 },
  { name: 'Eye Drops', category: 'drops', price: 18 },
  { name: 'Insulin', category: 'injection', price: 45 }
];

const pharmacyIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

async function seedStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Stock.deleteMany({});
    console.log('Cleared existing stock');

    const stockData = [];
    
    pharmacyIds.forEach(pharmacyId => {
      medicines.forEach(medicine => {
        stockData.push({
          pharmacy: pharmacyId,
          medicineName: medicine.name,
          category: medicine.category,
          quantity: Math.floor(Math.random() * 100) + 20,
          unitPrice: medicine.price,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          manufacturer: 'Generic Pharma',
          minStockLevel: 10,
          isAvailable: true
        });
      });
    });

    await Stock.insertMany(stockData);
    console.log(`Seeded ${stockData.length} stock items`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stock:', error);
    process.exit(1);
  }
}

seedStock();