const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { makePayment } = require('../controllers/paymentController');

// Simulated payment route
router.post('/:orderId/pay', protect, makePayment);

module.exports = router;
