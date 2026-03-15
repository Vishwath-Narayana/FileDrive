const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { updateProfile, changePassword, requestPasswordReset, verifyOTPAndResetPassword, uploadAvatar } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

router.put('/profile', authMiddleware, updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.put('/change-password', authMiddleware, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', verifyOTPAndResetPassword);

module.exports = router;

