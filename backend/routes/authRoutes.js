const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authControllers');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/private', protect, (req, res) => res.send('Private route - Authenticated user'));
router.get('/admin', protect, isAdmin, (req, res) => res.send('Admin only route'));
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
