const express = require('express');
const router = express.Router();
const { updateProfile, uploadAvatar } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { avatarUpload } = require('../middlewares/uploadMiddleware');

router.put('/profile', authMiddleware, updateProfile);
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;
