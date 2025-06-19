// controllers/adminDashboardController.js

const User = require('../models/User');
const Order = require('../models/Order');
const Dish = require('../models/Dish');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 💰 Total revenue (sum of totalAmount from all orders)
    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const totalDishes = await Dish.countDocuments(); // all
    const activeDishes = await Dish.countDocuments({ isDeleted: false }); // non-deleted

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalDishes,
      activeDishes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDashboardStats
};
