const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try { razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }); } catch {}
}

router.post('/create-order', protect, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay not configured' });
    const { orderId, amount, currency = 'INR' } = req.body;
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${orderId}`,
      notes: { orderId: order._id.toString() },
    });

    await Payment.create({
      order: order._id,
      userId: order.user,
      paymentMethod: 'razorpay',
      paymentGateway: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
      amount,
      currency,
      status: 'pending',
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID || '',
      currency,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Failed to create payment' });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const valid = generated === razorpay_signature;

    if (valid) {
      const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
      if (payment) {
        payment.status = 'completed';
        payment.gatewayPaymentId = razorpay_payment_id;
        payment.signature = razorpay_signature;
        await payment.save();
      }
      const order = await Order.findOne({ orderId });
      if (order && order.status === 'pending') {
        order.status = 'confirmed';
        order.paymentResult = { id: razorpay_payment_id, status: 'completed' };
        await order.save();
      }
      res.json({ success: true, message: 'Payment verified', orderId });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];
    if (webhookSecret && webhookSignature) {
      const payload = JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
      if (expected !== webhookSignature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;
    const paymentId = payload?.payment?.entity?.id;
    const orderId = payload?.order?.entity?.razorpay_order_id;
    const existing = await Payment.findOne({ gatewayPaymentId: paymentId });
    if (existing && existing.status === 'completed') {
      return res.json({ success: true, message: 'Already processed (idempotent)' });
    }

    if (event === 'payment.captured') {
      let payment = existing;
      if (!payment) {
        const order = orderId ? await Order.findOne({ orderId }) : null;
        payment = await Payment.create({
          order: order?._id || null,
          userId: order?.user || null,
          paymentMethod: 'razorpay',
          gatewayPaymentId: paymentId || '',
          gatewayOrderId: orderId || '',
          status: 'completed',
          amount: payload?.payment?.entity?.amount / 100 || 0,
        });
      } else {
        payment.status = 'completed';
        await payment.save();
      }
      if (orderId) {
        const order = await Order.findOne({ orderId });
        if (order && order.status !== 'cancelled') {
          order.status = 'confirmed';
          order.paymentResult = { id: paymentId, status: 'completed' };
          await order.save();
        }
      }
    }

    if (event === 'payment.failed') {
      if (existing) { existing.status = 'failed'; await existing.save(); }
    }

    res.json({ success: true });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Webhook failed' });
  }
});

module.exports = router;
