// controllers/adminUserController.js

const User = require('../models/User');
const Profile = require('../models/Profile'); // ✅ Needed to join with city info
const mongoose = require('mongoose');

// Get all users with optional filters: search (name/email) + city + pagination
const getAllUsers = async (req, res) => {
  try {
    const { search, city, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

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

    const totalCountPipeline = [...pipeline, { $count: 'total' }];
    const totalCountResult = await User.aggregate(totalCountPipeline);
    const total = totalCountResult[0]?.total || 0;

    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // 🛑 Exclude password before returning
    pipeline.push({
      $project: {
        password: 0,
        'profile._id': 0,
        'profile.__v': 0
      }
    });

    const users = await User.aggregate(pipeline);
    
    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: users
    });
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

// Get a single user by ID (with profile info)
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          password: 0, // Exclude password
          'profile._id': 0,
          'profile.__v': 0
        }
      }
    ]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user[0]); // Return first result (only one user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  getAllUsers,
  deleteUser,
  toggleAdminStatus,
  getUserById
};
