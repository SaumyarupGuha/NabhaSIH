const mongoose = require('mongoose');

const onlinePrescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photo: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  answer: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  hasReply: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OnlinePrescription', onlinePrescriptionSchema);