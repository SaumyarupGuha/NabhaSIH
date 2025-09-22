const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  healthData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthData',
    required: true
  },
  type: {
    type: String,
    enum: ['HIGH_TEMPERATURE', 'LOW_OXYGEN', 'HIGH_HEART_RATE', 'HIGH_BLOOD_PRESSURE'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
    default: 'ACTIVE'
  },
  acknowledgedAt: Date,
  resolvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);