const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Product', 'Order', 'User', 'Payment', 'Coupon', 'Review', 'Category', 'Setting', 'Auth', 'System'],
  },
  targetId: {
    type: String,
  },
  details: {
    type: Map,
    of: { type: String },
    default: {},
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ adminUser: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetType: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
