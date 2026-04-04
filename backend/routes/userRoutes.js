const express = require('express');
const router = express.Router();
const multer = require('multer');
const { updateProfile, uploadAvatar } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const { avatarStorage } = require('../config/cloudinaryConfig');

// Multer config for avatar uploads using Cloudinary
const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

router.put('/profile', authMiddleware, updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;
