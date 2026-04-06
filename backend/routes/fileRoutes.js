const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, downloadFile, viewFile, deleteFile, toggleFavorite, restoreFile } = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/', authMiddleware, getFiles);
router.get('/download/:id', authMiddleware, downloadFile);
router.get('/view/:id', authMiddleware, viewFile);
router.delete('/:id', authMiddleware, deleteFile);
router.post('/:id/favorite', authMiddleware, toggleFavorite);
router.post('/:id/restore', authMiddleware, restoreFile);

module.exports = router;
