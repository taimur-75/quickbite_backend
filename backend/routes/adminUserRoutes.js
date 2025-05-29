// routes/adminUserRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  deleteUser,
  toggleAdminStatus,
} = require('../controllers/adminUserController');

// Admin routes
router.get('/', protect, isAdmin, getAllUsers);
router.delete('/:id', protect, isAdmin, deleteUser);
router.put('/:id/toggle-admin', protect, isAdmin, toggleAdminStatus);

module.exports = router;
