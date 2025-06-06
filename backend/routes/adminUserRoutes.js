// routes/adminUserRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  deleteUser,
  toggleAdminStatus,
  getUserById
} = require('../controllers/adminUserController');

// Admin routes
router.get('/', protect, isAdmin, getAllUsers);// 🆗 Handles optional search & city filters
router.delete('/:id', protect, isAdmin, deleteUser);
router.put('/:id/toggle-admin', protect, isAdmin, toggleAdminStatus);
router.get('/:id', protect, isAdmin, getUserById);

module.exports = router;
