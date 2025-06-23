const express = require('express');
const {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish,
  restoreDish,
  hardDeleteDish,
  getSoftDeletedDishes
} = require('../controllers/dishController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, createDish);
router.get('/', getAllDishes);// 🔍 Supports optional ?search= & ?minPrice=&maxPrice= filtering
router.get('/:id', protect, getDishById);
router.put('/:id', protect, isAdmin, updateDish);
router.delete('/:id', protect, isAdmin, deleteDish);
router.put('/:id/restore', protect, isAdmin, restoreDish);
router.delete('/:id/hard-delete', protect, isAdmin, hardDeleteDish);
router.get('/deleted/list', protect, isAdmin, getSoftDeletedDishes); // 🗃️ View all soft-deleted dishes

module.exports = router;
