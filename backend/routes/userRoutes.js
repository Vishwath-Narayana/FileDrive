const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, requestPasswordReset, verifyOTPAndResetPassword } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', verifyOTPAndResetPassword);

module.exports = router;
