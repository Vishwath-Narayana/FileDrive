const multer = require('multer');
const { fileStorage } = require('../config/cloudinaryConfig');

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

module.exports = upload;
