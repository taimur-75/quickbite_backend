// controllers/adminUserController.js

const User = require('../models/User');
const Profile = require('../models/Profile'); // ✅ Needed to join with city info

// Get all users with optional filters: search (name/email) + city
const getAllUsers = async (req, res) => {
  try {
    const { search, city } = req.query;

    const matchStage = {};

    // 🔍 Filter by search on name or email
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // 🔄 Mongoose aggregation to join with Profile and filter by city
    const pipeline = [
      { $match: matchStage }, // Match on User collection
      {
        $lookup: {
          from: 'profiles', // 👈 must match the actual MongoDB collection name
          localField: '_id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }, // allows users without profiles
    ];

    // 🏙️ If city filter exists, apply match on joined profile.city
    if (city) {
      pipeline.push({
        $match: { 'profile.address.city': { $regex: city, $options: 'i' } }
      });
    }

    // 🛑 Exclude password before returning
    pipeline.push({
      $project: {
        password: 0,
        'profile._id': 0,
        'profile.__v': 0
      }
    });

    const users = await User.aggregate(pipeline);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle admin status for a user
const toggleAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = user.role === 'admin' ? 'user' : 'admin';
      await user.save();
      res.status(200).json({ message: 'User role updated successfully', newRole: user.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  toggleAdminStatus,
};
