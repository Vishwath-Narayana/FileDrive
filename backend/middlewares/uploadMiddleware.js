const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Organization = require('../models/Organization');
const { s3, BUCKET } = require('../config/storage');

const MAX_FILE_BYTES = 50 * 1024 * 1024;

// Runs BEFORE the upload so unauthorised users never get bytes stored in the bucket.
// The org id travels in the query string because multipart fields are not parsed yet.
const authorizeUpload = async (req, res, next) => {
  try {
    const organizationId = req.query.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'Organization ID is required' });

    const org = await Organization.findById(organizationId).select('members');
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const member = org.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member || !['admin', 'editor'].includes(member.role)) {
      return res.status(403).json({ message: 'Only admins and editors can upload files' });
    }
    req.uploadOrgId = organizationId;
    next();
  } catch (e) {
    next(e);
  }
};

const fileUpload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(0, 12).replace(/[^.\w]/g, '');
      cb(null, `orgs/${req.uploadOrgId}/${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_BYTES },
});

const avatarUpload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' }[file.mimetype] || '.jpg';
      cb(null, `avatars/${req.user._id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Only PNG, JPEG or WebP images are allowed'), { status: 400 }));
  },
});

module.exports = { authorizeUpload, upload: fileUpload, avatarUpload };
