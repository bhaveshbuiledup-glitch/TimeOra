const mongoose = require('mongoose');

const taxConfigSchema = new mongoose.Schema({
  taxRate: {
    type: Number,
    default: 0.18,
    min: 0,
    max: 1,
  },
  taxName: {
    type: String,
    default: 'GST',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const shippingConfigSchema = new mongoose.Schema({
  freeShippingThreshold: {
    type: Number,
    default: 5000,
    min: 0,
  },
  standardRate: {
    type: Number,
    default: 200,
    min: 0,
  },
  expressRate: {
    type: Number,
    default: 500,
    min: 0,
  },
}, {
  timestamps: true,
});

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

const TaxConfig = mongoose.model('TaxConfig', taxConfigSchema);
const ShippingConfig = mongoose.model('ShippingConfig', shippingConfigSchema);
const Setting = mongoose.model('Setting', settingSchema);

module.exports = { TaxConfig, ShippingConfig, Setting };
