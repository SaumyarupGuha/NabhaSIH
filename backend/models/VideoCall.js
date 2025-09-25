const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'rejected'],
    default: 'pending'
  },
  startTime: Date,
  endTime: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('VideoCall', videoCallSchema);