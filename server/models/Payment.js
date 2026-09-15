const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'card', 'wire', 'cod'],
  },
  paymentGateway: {
    type: String,
    default: '',
  },
  gatewayPaymentId: {
    type: String,
    default: '',
  },
  gatewayOrderId: {
    type: String,
    default: '',
  },
  signature: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundStatus: {
    type: String,
    default: 'not_refunded',
    enum: ['not_refunded', 'refund_pending', 'refunded', 'refund_failed'],
  },
  refundId: {
    type: String,
    default: '',
  },
  refundDate: {
    type: Date,
  },
  metadata: {
    type: Map,
    of: { type: String },
    default: {},
  },
}, {
  timestamps: true,
});

paymentSchema.index({ order: 1 }, { unique: true });
paymentSchema.index({ gatewayPaymentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
