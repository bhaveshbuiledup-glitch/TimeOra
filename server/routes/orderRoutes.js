const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { TaxConfig, ShippingConfig } = require('../models/Setting');
const { logError } = require('../utils/logger');

const calculateTax = (subtotal, taxRate) => {
  return Math.round(subtotal * taxRate * 100) / 100;
};

const calculateShipping = (subtotal, shippingMethod) => {
  return new Promise(async (resolve) => {
    try {
      const config = await ShippingConfig.findOne().sort({ createdAt: -1 }).exec();
      const freeThreshold = config?.freeShippingThreshold || 5000;
      const standardRate = config?.standardRate || 200;
      const expressRate = config?.expressRate || 500;

      if (subtotal >= freeThreshold) {
        return resolve(0);
      }
      if (shippingMethod === 'express') {
        resolve(expressRate);
      } else {
        resolve(standardRate);
      }
    } catch (err) {
      logError(err);
      resolve(0);
    }
  });
};

const validateMongoId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/', protect, async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const {
      items, shippingInfo, paymentMethod, shippingMethod,
      couponCode, billingInfo,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const userId = req.user._id;

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.productId || item.product;
      if (!validateMongoId(productId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID: ${item.productId || item.product}` });
      }

      const product = await Product.findById(productId).session(session);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Product is unavailable: ${product.name}` });
      }

      const requestedQty = Number(item.quantity) || 1;
      if (requestedQty < 1) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` });
      }

      if (product.stock < requestedQty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const price = product.effectivePrice || product.price;
      const itemTotal = price * requestedQty;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        image: product.images?.[0] || '',
        price: price,
        discountPrice: product.discountPrice || null,
        quantity: requestedQty,
        selectedColor: item.selectedColor || 'Standard',
      });
    }

    let discountAmount = 0;
    let couponData = null;
    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true }).session(session);
      if (coupon) {
        const now = Date.now();
        if (coupon.startDate && now < new Date(coupon.startDate).getTime()) {
          return res.status(400).json({ success: false, message: 'Coupon not yet active' });
        }
        if (coupon.expiryDate && now > new Date(coupon.expiryDate).getTime()) {
          return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }
        if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
          return res.status(400).json({ success: false, message: `Minimum order amount for this coupon is ${coupon.minimumOrderAmount}` });
        }
        if (coupon.totalUsageLimit && coupon.totalUsageCount >= coupon.totalUsageLimit) {
          return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        discountAmount = coupon.discountType === 'percentage'
          ? Math.round(subtotal * (coupon.discountValue / 100))
          : coupon.discountValue;

        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }

        if (discountAmount > subtotal) discountAmount = subtotal;

        couponData = { code: coupon.code, discount: discountAmount };

        coupon.totalUsageCount = (coupon.totalUsageCount || 0) + 1;
        coupon.usageHistory.push({ userId, orderId: 'TM-ORD-' + Math.floor(100000 + Math.random() * 900000) });
        await coupon.save({ session });
      }
    }

    const taxableAmount = subtotal - discountAmount;
    const taxRateRes = await TaxConfig.findOne().sort({ createdAt: -1 }).exec();
    const taxRate = taxRateRes?.taxRate || 0.18;
    const taxAmount = calculateTax(taxableAmount, taxRate);
    const shippingCost = await calculateShipping(subtotal, shippingMethod || 'express');
    const total = taxableAmount + taxAmount + shippingCost;

    const orderId = 'TM-ORD-' + Math.floor(100000 + Math.random() * 900000);

    const order = await Order.create([{
      user: userId,
      orderId,
      items: orderItems,
      shippingInfo,
      billingInfo: billingInfo || { ...shippingInfo },
      shippingMethod: shippingMethod || 'express',
      shippingCost,
      paymentMethod: paymentMethod || 'razorpay',
      subtotal,
      discountAmount,
      couponApplied: couponData,
      taxableAmount,
      taxRate,
      taxAmount,
      total,
      status: 'pending',
      orderStatusHistory: [{ status: 'pending', note: 'Order created' }],
      isGuest: false,
    }], { session });

    for (const item of items) {
      const productId = item.productId || item.product;
      const requestedQty = Number(item.quantity) || 1;
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -requestedQty } },
        { session, new: true }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      order: {
        ...order.toObject(),
        orderId,
        total,
        subtotal,
        discountAmount,
        taxAmount,
        shippingCost,
      },
    });
  } catch (error) {
    logError(error);
    try { await session.abortTransaction(); } catch {}
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, note, trackingInfo } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: ['return_requested'],
      cancelled: [],
      return_requested: ['returned', 'refunded'],
      returned: [],
      refunded: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
    }

    order.status = status;
    order.orderStatusHistory.push({
      status,
      note: note || '',
      changedBy: req.user.name,
      changedAt: new Date(),
    });

    if (trackingInfo) {
      order.trackingInfo = { ...order.trackingInfo, ...trackingInfo };
    }

    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    if (status === 'return_requested' || status === 'returned' || status === 'refunded') {
      if (!order.returnRequest) order.returnRequest = {};
      order.returnRequest.status = status;
      if (status === 'returned') order.returnRequest.requestedAt = new Date();
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', admin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.orderId = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({ success: true, orders, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
