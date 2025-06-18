const express = require('express');
const router = express.Router();
const { protect, isAdmin} = require('../middlewares/authMiddleware');
const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.patch('/:orderId', protect, isAdmin, updateOrderStatus);
router.get('/:orderId', protect, getOrderById); // get specific order (admin or owner)
router.delete('/:orderId', protect, isAdmin, deleteOrder); // delete order (admin only)

module.exports = router;

