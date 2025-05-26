const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');

const router = express.Router();

router.use(protect); // All cart routes are protected

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:dishId', updateCartItem);
router.delete('/:dishId', removeCartItem);

module.exports = router;
