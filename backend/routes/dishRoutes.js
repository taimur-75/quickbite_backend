const express = require('express');
const {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish
} = require('../controllers/dishController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, createDish);
router.get('/', protect, getAllDishes);// 🔍 Supports optional ?search= query
router.get('/:id', protect, getDishById);
router.put('/:id', protect, isAdmin, updateDish);
router.delete('/:id', protect, isAdmin, deleteDish);

module.exports = router;
