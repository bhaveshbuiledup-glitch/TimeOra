const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String, default: 'Standard' },
  }],
  shippingInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    orderNotes: { type: String, default: '' },
  },
  billingInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  shippingMethod: {
    type: String,
    default: 'express',
    enum: ['standard', 'express'],
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'razorpay', 'wire', 'cod'],
    default: 'razorpay',
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
    method: { type: String },
    cardLast4: { type: String },
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  couponApplied: {
    code: { type: String, default: null },
    discount: { type: Number, default: 0 },
  },
  taxableAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'],
  },
  orderStatusHistory: [{
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedBy: { type: String },
    changedAt: { type: Date, default: Date.now },
  }],
  trackingInfo: {
    carrier: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
  },
  cancelledAt: { type: Date },
  cancelledReason: { type: String },
  returnRequest: {
    requestedAt: { type: Date },
    reason: { type: String },
    status: { type: String, default: null },
    refundAmount: { type: Number },
    refundMethod: { type: String },
  },
  refundInfo: {
    refundId: { type: String },
    refundDate: { type: Date },
    refundAmount: { type: Number },
    refundStatus: { type: String },
    refundMethod: { type: String },
  },
  shippingAddressRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  guestEmail: { type: String },
  guestToken: { type: String },
}, {
  timestamps: true,
});

orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
