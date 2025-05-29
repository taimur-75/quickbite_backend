const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture
} = require('../controllers/profileController');

router.get('/me', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/upload', protect, upload.single('photo'), uploadProfilePicture);

module.exports = router;
