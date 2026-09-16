const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { logError } = require('../utils/logger');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

router.get('/demo-data', async (req, res) => {
  try {
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'TIMEORA Admin',
        email: 'timeoraa@gmail.com',
        password: 'Time@1266',
        role: 'admin',
      });
    }

    let coupon = await Coupon.findOne({ code: 'ROYAL10' });
    if (!coupon) {
      coupon = await Coupon.create({
        code: 'ROYAL10',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderAmount: 1000,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
    }

    const products = await Product.find({});
    const hasProducts = products.length > 0;

    res.json({
      success: true,
      hasAdminUser: !!admin,
      adminEmail: admin.email,
      hasDemoCoupon: !!coupon,
      couponCode: coupon.code,
      hasProducts,
      productCount: products.length,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
