// routes/adminOrderRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const {
  getAllOrders,
  updateOrderStatus,
  getOrderByIdAdmin
} = require('../controllers/adminOrderController');

// Admin routes
router.get('/', protect, isAdmin, getAllOrders);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);
router.get('/:id', protect, isAdmin, getOrderByIdAdmin);

module.exports = router;
