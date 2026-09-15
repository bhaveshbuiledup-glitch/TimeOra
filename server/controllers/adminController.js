const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { logError } = require('../utils/logger');
const { protect, admin } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

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
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const hashed = await bcrypt.hash('Time@1266', 10);
      adminUser = await User.create({
        name: 'TIMEORA Admin',
        email: 'timeoraa@gmail.com',
        password: hashed,
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

    res.json({
      success: true,
      hasAdminUser: !!adminUser,
      adminEmail: adminUser.email,
      hasDemoCoupon: !!coupon,
      couponCode: coupon.code,
      hasProducts: products.length > 0,
      productCount: products.length,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/low-stock', protect, admin, async (req, res) => {
  try {
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '5');
    const products = await Product.find({ stock: { $lte: threshold }, isActive: true }).lean();
    res.json({ success: true, products });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dashboard/stats', protect, admin, async (req, res) => {
  try {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    const totalCustomers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    const revenue7 = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: new Date(sevenDaysAgo) } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const ordersByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(sevenDaysAgo) }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]);

    const ordersByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(sevenDaysAgo) }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]);

    const lowStock = await Product.find({ stock: { $lte: parseInt(process.env.LOW_STOCK_THRESHOLD || '5') } }).select('name sku stock').lean();

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalProducts,
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        pendingOrders,
        revenue7Days: revenue7[0]?.total || 0,
        revenue30Days: 0,
        revenue1Year: 0,
      },
      ordersByDay,
      ordersByMonth,
      lowStock,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
