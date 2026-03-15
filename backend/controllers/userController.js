const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const path = require('path');
const { sendPasswordResetOTP } = require('../utils/email');

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

    const avatarUrl = `/uploads/${req.file.filename}`;
    
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

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await PasswordReset.create({
      user: user._id,
      email: email.toLowerCase(),
      otp,
      expiresAt
    });
    
    try {
      await sendPasswordResetOTP(email, otp, user.name);
    } catch (emailError) {
      console.warn('Failed to send OTP email but creating the reset request internal flow. Error:', emailError.message);
    }
    
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const passwordReset = await PasswordReset.findOne({
      email: email.toLowerCase(),
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    const user = await User.findById(passwordReset.user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    passwordReset.isUsed = true;
    await passwordReset.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
