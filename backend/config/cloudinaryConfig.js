const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'filedrive/files',
    resource_type: 'auto',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return uniqueSuffix + '-' + file.originalname.split('.')[0];
    }
  }
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'filedrive/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req, file) => `avatar-${req.user._id}-${Date.now()}`
  }
});

module.exports = {
  cloudinary,
  fileStorage,
  avatarStorage
};
