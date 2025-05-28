const Profile = require('../models/Profile');

const createOrUpdateProfile = async (req, res) => {
  try {
    const profileData = {
      phone: req.body.phone,
      address: req.body.address
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileData, user: req.user._id },
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile
};
