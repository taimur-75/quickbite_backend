const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
//const { makePayment } = require('../controllers/paymentController');
const { 
    createCheckoutSession, 
    handleStripeWebhook 
} = require('../controllers/paymentController'); 

// Simulated payment route
//router.post('/:orderId/pay', protect, makePayment);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/webhook', handleStripeWebhook);

module.exports = router;


