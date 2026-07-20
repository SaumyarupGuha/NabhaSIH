const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String
  },
  reply: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  hasReply: {
    type: Boolean,
    default: false
  },
  hasNewReply: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);