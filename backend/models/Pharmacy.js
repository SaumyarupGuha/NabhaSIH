const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  status: {
    type: String,
    default: 'Open'
  },
  hours: {
    type: String
  },
  notes: {
    type: String
  },
  services: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 4.5
  },
  isOpen24Hours: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);