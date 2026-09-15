const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  brand: {
    type: String,
    default: 'TIMEORA',
  },
  tagline: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  categoryName: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    required: [true, 'Please provide target gender'],
    enum: ['Men', 'Women', 'Unisex'],
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock count'],
    default: 10,
    min: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
  },
  sku: {
    type: String,
    required: [true, 'Please provide SKU'],
    unique: true,
    trim: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  video: {
    type: String,
    default: '',
  },
  colors: [{
    type: String,
  }],
  strapMaterial: {
    type: String,
    default: 'Italian Genuine Alligator Leather',
  },
  caseMaterial: {
    type: String,
    default: '316L Stainless Steel',
  },
  dialColor: {
    type: String,
    default: 'Sunburst Black',
  },
  movement: {
    type: String,
    default: 'Calibre TM Automatic (28,800 vph)',
  },
  waterResistance: {
    type: String,
    default: '100M / 10 ATM',
  },
  warranty: {
    type: String,
    default: '5-Year International Manufacturer Warranty',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  bestSeller: {
    type: Boolean,
    default: false,
  },
  newArrival: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  specifications: {
    type: Map,
    of: { type: String },
    default: {},
  },
}, {
  timestamps: true,
});

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, createdAt: -1 });
productSchema.index({ isActive: 1 });

productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

productSchema.virtual('discountPercent').get(function () {
  if (this.discountPrice && this.discountPrice < this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
