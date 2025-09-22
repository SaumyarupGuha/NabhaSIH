const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  heartRate: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  oxygenSaturation: {
    type: Number,
    required: true
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  deviceId: {
    type: String,
    default: 'simulator'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthData', healthDataSchema);