const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/users', authMiddleware, getAllUsers);

module.exports = router;
