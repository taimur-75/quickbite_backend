const Profile = require('../models/Profile');
const path = require('path');

// GET /api/profile/me
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/profile/update
const updateProfile = async (req, res) => {
  try {
    const { phone, address, bio } = req.body;

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { phone, address, bio } },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/profile/upload
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { avatar: avatarPath } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: 'Profile picture uploaded successfully',
      avatar: avatarPath,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture
};
