const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');

router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minimumOrderAmount, startDate, expiryDate, totalUsageLimit, perUserUsageLimit, applicableProducts, applicableCategories } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minimumOrderAmount: minimumOrderAmount || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalUsageLimit,
      perUserUsageLimit,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.expiryDate) updates.expiryDate = new Date(updates.expiryDate);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/active', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(400).json({ success: false, message: 'Invalid coupon' });

    const now = Date.now();
    if (coupon.startDate && now < new Date(coupon.startDate).getTime()) {
      return res.status(400).json({ success: false, message: 'Coupon not yet active' });
    }
    if (coupon.expiryDate && now > new Date(coupon.expiryDate).getTime()) {
      return res.status(400).json({ success: false, message: 'Coupon expired' });
    }
    if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order: ${coupon.minimumOrderAmount}` });
    }
    if (coupon.totalUsageLimit && coupon.totalUsageCount >= coupon.totalUsageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    let discount = coupon.discountType === 'percentage'
      ? Math.round(subtotal * (coupon.discountValue / 100))
      : coupon.discountValue;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    if (discount > subtotal) discount = subtotal;

    res.json({
      success: true,
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discount,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
