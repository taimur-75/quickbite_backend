const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createOrUpdateProfile, getProfile } = require('../controllers/profileController');

router.post('/', protect, createOrUpdateProfile);
router.get('/', protect, getProfile);

module.exports = router;
