const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tablet', 'syrup', 'injection', 'capsule', 'ointment', 'drops'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  batchNumber: String,
  manufacturer: String,
  minStockLevel: {
    type: Number,
    default: 10
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

stockSchema.index({ pharmacy: 1, medicineName: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);