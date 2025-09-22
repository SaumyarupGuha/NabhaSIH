const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderType: {
    type: String,
    enum: ['patient', 'hospital'],
    required: true
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'orderType',
    required: true
  },
  assignedPharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  },
  items: [{
    medicineName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'rejected', 'preparing', 'ready', 'delivered'],
    default: 'pending'
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  deliveryAddress: {
    type: String,
    required: function() { return this.deliveryType === 'delivery'; }
  },
  customerInfo: {
    name: String,
    phone: String,
    address: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  estimatedTime: Date,
  rejectionReason: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);