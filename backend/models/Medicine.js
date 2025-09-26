const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: String,
  genericName: String,
  category: String,
  manufacturer: String,
  price: Number,
  description: String,
  dosage: String,
  prescriptionRequired: Boolean,
  inStock: Boolean,
  stockQuantity: Number
}, {
  timestamps: true
});

medicineSchema.index({ name: 'text', genericName: 'text', category: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema, 'test.medicines');