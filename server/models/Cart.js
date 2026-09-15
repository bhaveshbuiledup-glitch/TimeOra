const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    image: { type: String, required: true },
    selectedColor: { type: String, default: 'Standard' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

cartSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
