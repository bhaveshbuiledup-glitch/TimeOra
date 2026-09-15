const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { logError } = require('../utils/logger');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try { razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }); } catch {}
}

router.post('/verify', async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay not configured' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const valid = generated === razorpay_signature;
    res.json({ success: valid, verified: valid });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await mongoose.model('Order').findOne({ orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({
      success: true,
      order: {
        orderId: order.orderId, status: order.status, total: order.total,
        items: order.items.length, subtotal: order.subtotal,
        discountAmount: order.discountAmount, taxAmount: order.taxAmount,
        shippingCost: order.shippingCost, paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Validation failed' });
  }
});

module.exports = router;
