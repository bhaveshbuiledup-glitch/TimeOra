const mongoose = require('mongoose');
const Product = require('../models/Product');
const fallbackWatches = require('../data/seedData');

// @desc    Fetch all products with filtering, search and sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, search, sort } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (gender && gender !== 'All') {
      query.gender = { $in: [gender, 'Unisex'] };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { movement: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popularity') sortOption = { reviewsCount: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    let products = [];
    if (mongoose.connection.readyState === 1) {
      try {
        products = await Product.find(query).sort(sortOption);
      } catch (e) {
        console.warn('Database query failed:', e.message);
      }
    }

    // If DB is empty, auto-seed or return fallback watches
    if (!products || products.length === 0) {
      return res.json({
        success: true,
        count: fallbackWatches.length,
        products: fallbackWatches,
        source: 'catalog-cache'
      });
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product by ID or SKU
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    let product;
    try {
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(req.params.id);
      } else {
        product = await Product.findOne({ sku: req.params.id });
      }
    } catch (e) {
      // Fallback
    }

    if (!product) {
      // Search in fallback
      const found = fallbackWatches.find(w => w.sku === req.params.id || w.id === req.params.id);
      if (found) return res.json({ success: true, product: found });
      return res.status(404).json({ success: false, message: 'Timepiece not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      id: req.body.id || `tm-${Date.now()}`,
      sku: req.body.sku || `TM-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: 'TIMEORA',
      stock: Number(req.body.stock) >= 0 ? Number(req.body.stock) : 10,
      price: Number(req.body.price),
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null,
      images: Array.isArray(req.body.images) && req.body.images.length > 0
        ? req.body.images
        : [req.body.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'],
      video: req.body.video || '',
      category: req.body.category || 'Chronograph',
      gender: req.body.gender || 'Unisex',
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const product = new Product(productData);
      const createdProduct = await product.save();
      return res.status(201).json({ success: true, product: createdProduct });
    }

    // Fallback in-memory catalog
    fallbackWatches.unshift(productData);
    res.status(201).json({ success: true, product: productData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (product) return res.json({ success: true, product });
    }

    // Fallback update
    const index = fallbackWatches.findIndex(w => w.id === id || w._id === id || w.sku === id);
    if (index > -1) {
      fallbackWatches[index] = { ...fallbackWatches[index], ...req.body };
      return res.json({ success: true, product: fallbackWatches[index] });
    }

    res.status(404).json({ success: false, message: 'Timepiece not found' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState === 1 && id.match(/^[0-9a-fA-F]{24}$/)) {
      const product = await Product.findByIdAndDelete(id);
      if (product) return res.json({ success: true, message: 'Timepiece removed from catalog' });
    }

    // Fallback delete
    const index = fallbackWatches.findIndex(w => w.id === id || w._id === id || w.sku === id);
    if (index > -1) {
      fallbackWatches.splice(index, 1);
      return res.json({ success: true, message: 'Timepiece removed from catalog' });
    }

    res.status(404).json({ success: false, message: 'Timepiece not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
