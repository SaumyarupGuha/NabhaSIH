const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'pharmacy_signup',
      'pharmacy_verification',
      'order_created',
      'order_assigned',
      'order_status_changed',
      'stock_updated',
      'distance_calculated',
      'pharmacy_availability_changed',
      'user_login',
      'user_logout'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['user', 'pharmacy', 'order', 'stock', 'system']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: {
      lat: Number,
      lng: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Indexes for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ pharmacyId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Static method to log actions
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const log = new this(actionData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw error to prevent disrupting main operations
  }
};

// Static method to get audit trail for entity
auditLogSchema.statics.getAuditTrail = async function(entityType, entityId, limit = 50) {
  return this.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .populate('pharmacyId', 'name');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);