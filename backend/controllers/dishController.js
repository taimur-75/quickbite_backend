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

// Read All
const getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
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
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json({ msg: 'Dish deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish
};
