const Rating = require('../models/Rating');
const mongoose = require('mongoose');

const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const dishId = req.params.dishId;
    const userId = req.user._id;

    // Optional: Prevent duplicate rating by same user for same dish
    const existing = await Rating.findOne({ user: userId, dish: dishId });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this dish' });
    }

    const newRating = new Rating({
      user: userId,
      dish: dishId,
      rating,
      review
    });

    const saved = await newRating.save();
    res.status(201).json({ message: 'Rating submitted successfully', data: saved });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRatingsByDishId = async (req, res) => {
  try {
    const dishId = req.params.dishId;

    const ratings = await Rating.find({ dish: dishId })
      .populate('user', 'name') // Only fetch user name
      .sort({ createdAt: -1 });  // Newest first

    res.status(200).json({
      total: ratings.length,
      data: ratings
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings', error: err.message });
  }
};

// get all own ratings by user self, while logged in.
const getRatingsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const ratings = await Rating.find({ user: userId })
      .populate('dish', 'name price category') // Optional: include dish info
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: ratings.length,
      data: ratings
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings', error: err.message });
  }
};

// delete own rating by user, logged in.
const deleteRatingByUser = async (req, res) => {
  try {
    const ratingId = req.params.id;
    const userId = req.user._id;

    const rating = await Rating.findOne({ _id: ratingId, user: userId });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found or unauthorized' });
    }

    await Rating.findByIdAndDelete(ratingId);

    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete rating', error: err.message });
  }
};

// admin get avg rating by dish id

const getAverageRatingForDish = async (req, res) => {
  try {
    const dishId = new mongoose.Types.ObjectId(req.params.dishId); // ✅ convert to ObjectId

    const result = await Rating.aggregate([
      { $match: { dish: dishId } },
      {
        $group: {
          _id: '$dish',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No ratings found for this dish' });
    }

    res.status(200).json({
      dishId: req.params.dishId,
      averageRating: result[0].averageRating.toFixed(2),
      totalRatings: result[0].totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching average rating', error: error.message });
  }
};


module.exports = {
  addRating,
  getRatingsByDishId,
  getRatingsByUser,
  deleteRatingByUser,
  getAverageRatingForDish
};
