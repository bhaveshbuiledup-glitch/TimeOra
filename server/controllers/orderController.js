const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private / Public (Guest checkout supported)
const addOrderItems = async (req, res) => {
  try {
    const {
      items,
      shippingInfo,
      paymentMethod,
      shippingMethod,
      subtotal,
      shippingCost,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order payload' });
    }

    const orderId = 'TM-ORD-' + Math.floor(100000 + Math.random() * 900000);

    const order = new Order({
      user: req.user ? req.user._id : null,
      orderId,
      items,
      shippingInfo,
      paymentMethod,
      shippingMethod,
      subtotal,
      shippingCost,
      total,
      status: 'Processing & Handcrafting',
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id }).populate('user', 'name email');

    if (order) {
      res.json({ success: true, order });
    } else {
      res.status(404).json({ success: false, message: 'Order reference not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
};
