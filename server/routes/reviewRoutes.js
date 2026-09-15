const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const orderItem = await mongoose.model('Order').findOne({
      user: req.user._id,
      items: { $elemMatch: { product: productId } },
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating, title, comment,
      isVerifiedPurchase: !!orderItem,
      status: 'pending',
    });

    product.reviewsCount = await Review.countDocuments({ product: productId, status: 'approved' });
    const avgRating = await Review.aggregate([
      { $match: { product: productId, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    product.rating = avgRating.length > 0 ? avgRating[0].avgRating : 5.0;
    await product.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (status === 'approved' || status === 'rejected') {
      const product = await Product.findById(review.product);
      if (product) {
        const approved = await Review.countDocuments({ product: review.product, status: 'approved' });
        product.reviewsCount = approved;
        const avgRating = await Review.aggregate([
          { $match: { product: review.product, status: 'approved' } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);
        product.rating = avgRating.length > 0 ? avgRating[0].avgRating : 5.0;
        await product.save();
      }
    }

    res.json({ success: true, review });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', admin, async (req, res) => {
  try {
    const reviews = await Review.find().populate('product', 'name').populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
