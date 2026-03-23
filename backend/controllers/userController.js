const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, age, email } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (age !== undefined) user.age = age;
    
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email.toLowerCase();
    }
    
    await user.save();
    
    const updatedUser = await User.findById(user._id).select('-password');
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

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user._id);
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate a magic link for password reset (no email — link is shown to the user)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }
    
    // Generate a JWT token for reset (expires in 10 minutes)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    res.json({ 
      message: 'Reset link generated',
      resetLink
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reset password using the magic link token
exports.resetPasswordByToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset link' });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
