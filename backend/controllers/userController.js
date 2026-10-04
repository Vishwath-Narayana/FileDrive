const User = require('../models/User');
const { publicUrl, deleteObject } = require('../config/storage');

exports.updateProfile = async (req, res) => {
  try {
    const { name, age } = req.body;
    const update = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed || trimmed.length > 80) {
        return res.status(400).json({ message: 'Name must be 1-80 characters' });
      }
      update.name = trimmed;
    }

    if (age !== undefined) {
      if (age === null || age === '') {
        update.age = null;
      } else {
        const n = Number(age);
        if (!Number.isInteger(n) || n < 0 || n > 120) {
          return res.status(400).json({ message: 'Age must be a whole number between 0 and 120' });
        }
        update.age = n;
      }
    }

    // `avatar` is deliberately not accepted here: it is only set by the upload endpoint.
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const avatarUrl = publicUrl(req.file.key);
    if (!avatarUrl) {
      deleteObject(req.file.key).catch(() => {});
      return res.status(503).json({ message: 'Avatar hosting is not configured (R2_PUBLIC_URL)' });
    }

    const previous = req.user.avatar;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    // Best-effort cleanup of the previous avatar object.
    const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    if (previous && base && previous.startsWith(`${base}/avatars/`)) {
      deleteObject(previous.slice(base.length + 1)).catch(() => {});
    }

    res.json({ avatar: avatarUrl, message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
};
