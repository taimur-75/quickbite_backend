const Dish = require('../models/Dish');

// Create
const createDish = async (req, res) => {
  try {
    const dish = new Dish(req.body);
    const saved = await dish.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All — With search + price filter + pagination
const getAllDishes = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    let query = { isDeleted: false }; // Show only non-deleted dishes

    // 🔍 Search by name or category
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // 💰 Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Dish.countDocuments(query);
    const dishes = await Dish.find(query).skip(skip).limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: dishes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read One
const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json(dish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json(dish);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }, // Mark as deleted
      { new: true }
    );

    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json({ msg: 'Dish deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔁 Restore a soft-deleted dish
const restoreDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true } // Return the updated dish
    );

    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    res.status(200).json({ message: 'Dish restored successfully', dish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 💀 Permanently delete a dish (hard delete)
const hardDeleteDish = async (req, res) => {
  try {
    const deleted = await Dish.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.status(200).json({ message: 'Dish permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📦 Get all soft-deleted dishes
const getSoftDeletedDishes = async (req, res) => {
  try {
    const deletedDishes = await Dish.find({ isDeleted: true });

    res.status(200).json({
      total: deletedDishes.length,
      data: deletedDishes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish,
  restoreDish,
  hardDeleteDish,
  getSoftDeletedDishes
};
