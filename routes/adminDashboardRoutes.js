// routes/adminDashboardRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { getDashboardStats } = require('../controllers/adminDashboardController');

router.get('/stats', protect, isAdmin, getDashboardStats);

module.exports = router;
