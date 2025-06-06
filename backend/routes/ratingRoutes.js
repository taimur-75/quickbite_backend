const express = require('express');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { 
    addRating, 
    getRatingsByDishId, 
    getRatingsByUser, 
    deleteRatingByUser,
    getAverageRatingForDish
} = require('../controllers/ratingController');

const router = express.Router();

// 👤 Authenticated user can rate a dish
router.post('/:dishId', protect, addRating);

// Public route – no authentication needed
router.get('/dish/:dishId', getRatingsByDishId);

// ⭐ New Route: Get all ratings by current user
router.get('/my', protect, getRatingsByUser);

// 🗑️ New route to delete a rating by logged-in user
router.delete('/:id', protect, deleteRatingByUser);

// 👑 Admin can view average rating of a dish
router.get('/average/:dishId', protect, isAdmin, getAverageRatingForDish);

module.exports = router;
