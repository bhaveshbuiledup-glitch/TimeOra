const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    selectedColor: { type: String, default: 'Standard' },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  }],
  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    orderNotes: String
  },
  shippingMethod: {
    type: String,
    default: 'express'
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'card'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0.0
  },
  total: {
    type: Number,
    required: true,
    default: 0.0
  },
  status: {
    type: String,
    default: 'Processing & Handcrafting',
    enum: ['Processing & Handcrafting', 'Chronometer Regulated', 'Dispatched via Armored Express', 'Delivered to Patron', 'Cancelled']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
