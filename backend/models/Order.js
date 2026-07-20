const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicines: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  prescriptionUrl: String,
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
orderSchema.index({ status: 1, acceptedBy: 1 });

module.exports = mongoose.model('Order', orderSchema);