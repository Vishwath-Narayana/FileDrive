const User = require('../models/User');
const path = require('path');

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, age } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (age !== undefined) user.age = age;

    await user.save();

    const updatedUser = await User.findById(user._id);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const avatarUrl = req.file.path; // Cloudinary URL

    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    res.json({ avatar: avatarUrl, message: 'Avatar updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
