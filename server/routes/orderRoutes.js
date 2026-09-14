const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(addOrderItems); // Guest checkout allowed

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(getOrderById);

module.exports = router;
