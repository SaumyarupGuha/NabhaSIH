const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    required: true
  },
  alternatives: [{
    type: String
  }],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  dosage: String,
  category: String
}, {
  timestamps: true
});

medicineSchema.index({ name: 'text', brand: 'text', alternatives: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);