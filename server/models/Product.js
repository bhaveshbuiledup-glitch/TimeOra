const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  brand: {
    type: String,
    default: 'TIMEORA'
  },
  tagline: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['Chronograph', 'Dress', 'Diver', 'Complication', 'Skeleton', 'Minimalist', 'Vintage', 'Haute Horlogerie']
  },
  gender: {
    type: String,
    required: [true, 'Please provide target gender'],
    enum: ['Men', 'Women', 'Unisex']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock count'],
    default: 10,
    min: 0
  },
  sku: {
    type: String,
    required: [true, 'Please provide SKU'],
    unique: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  video: {
    type: String,
    default: ''
  },
  colors: [{
    type: String
  }],
  strapMaterial: {
    type: String,
    default: 'Italian Genuine Alligator Leather'
  },
  caseMaterial: {
    type: String,
    default: '316L Stainless Steel'
  },
  dialColor: {
    type: String,
    default: 'Sunburst Black'
  },
  movement: {
    type: String,
    default: 'Calibre TM Automatic (28,800 vph)'
  },
  waterResistance: {
    type: String,
    default: '100M / 10 ATM'
  },
  warranty: {
    type: String,
    default: '5-Year International Manufacturer Warranty'
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
