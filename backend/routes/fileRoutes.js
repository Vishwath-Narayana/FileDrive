const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, downloadFile, viewFile, deleteFile, toggleFavorite, restoreFile } = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorizeUpload, upload } = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

// authorizeUpload must run before multer so rejected users never write to the bucket
router.post('/upload', authorizeUpload, upload.single('file'), uploadFile);
router.get('/', getFiles);
router.get('/download/:id', downloadFile);
router.get('/view/:id', viewFile);
router.delete('/:id', deleteFile);
router.post('/:id/favorite', toggleFavorite);
router.post('/:id/restore', restoreFile);

module.exports = router;
