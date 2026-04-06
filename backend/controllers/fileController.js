const File = require('../models/File');
const Organization = require('../models/Organization');
const { cloudinary } = require('../config/cloudinaryConfig');
const { getIO } = require('../socket');

const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') return 'csv';
  return 'other';
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const member = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'admin' && member.role !== 'editor')) {
      return res.status(403).json({ message: 'Only admins and editors can upload files' });
    }

    const fileType = getFileType(req.file.mimetype);

    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      cloudinaryPublicId: req.file.filename,
      resourceType: req.file.resource_type || 'auto',
      format: req.file.format || req.file.originalname.split('.').pop().toLowerCase(),
      size: req.file.size,
      fileType: fileType,
      uploader: req.user._id,
      organization: organizationId
    });

    const populatedFile = await File.findById(file._id).populate('uploader', 'name email');

    res.status(201).json(populatedFile);

    // 🔴 Real-time: notify all other members in the org
    try {
      const room = `org:${organizationId.toString()}`;
      console.log(`📡 Emitting file:new to room ${room}`);
      getIO().to(room).emit('file:new', populatedFile);
    } catch (e) { console.error('❌ Socket emit error:', e.message); }
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { search, type, organizationId, filter } = req.query;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = organization.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { organization: organizationId };

    if (filter === 'favorites') {
      query.favoritedBy = req.user._id;
      query.isDeleted = false;
    } else if (filter === 'trash') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }

    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.fileType = type;
    }

    const files = await File.find(query)
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Determine actual resource type from stored path if needed
    let resourceType = file.resourceType;
    if (!resourceType || resourceType === 'auto') {
      if (file.path.includes('/image/upload/')) resourceType = 'image';
      else if (file.path.includes('/raw/upload/')) resourceType = 'raw';
      else if (file.path.includes('/video/upload/')) resourceType = 'video';
    }

    // Get format (extension) - use stored format or extract from originalName as fallback
    const format = file.format || file.originalName.split('.').pop().toLowerCase();

    // Generate a signed download URL using Cloudinary's specialized private_download_url
    const downloadUrl = cloudinary.utils.private_download_url(file.cloudinaryPublicId, format, {
      resource_type: resourceType || 'auto',
      type: 'upload',
      attachment: true
    });
    
    console.log("DEBUG DOWNLOAD:", {
      fileType: file.fileType,
      resourceType,
      format,
      publicId: file.cloudinaryPublicId,
      finalUrl: downloadUrl
    });

    res.json({ downloadUrl });
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const organization = await Organization.findById(file.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const member = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isAdmin = member.role === 'admin';
    const isOwner = file.uploader.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own files' });
    }

    if (file.isDeleted) {
      if (file.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(file.cloudinaryPublicId);
      }
      await File.findByIdAndDelete(req.params.id);
      res.json({ message: 'File permanently deleted' });
      // 🔴 Real-time
      const room = `org:${file.organization.toString()}`;
      console.log(`📡 Emitting file:deleted to room ${room}`);
      try { getIO().to(room).emit('file:deleted', { fileId: req.params.id }); } catch (e) { console.error('❌ Socket emit error:', e.message); }
    } else {
      file.isDeleted = true;
      file.deletedAt = new Date();
      file.deletedBy = req.user._id;
      await file.save();
      res.json({ message: 'File moved to trash' });
      // 🔴 Real-time
      const room = `org:${file.organization.toString()}`;
      console.log(`📡 Emitting file:trashed to room ${room}`);
      try { getIO().to(room).emit('file:trashed', { fileId: req.params.id }); } catch (e) { console.error('❌ Socket emit error:', e.message); }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const organization = await Organization.findById(file.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = organization.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isFavorited = file.favoritedBy.includes(req.user._id);

    if (isFavorited) {
      file.favoritedBy = file.favoritedBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
    } else {
      file.favoritedBy.push(req.user._id);
    }

    await file.save();

    const updatedFile = await File.findById(file._id).populate('uploader', 'name email');

    res.json(updatedFile);
    // 🔴 Real-time
    const room = `org:${file.organization.toString()}`;
    console.log(`📡 Emitting file:favoriteUpdated to room ${room}`);
    try { getIO().to(room).emit('file:favoriteUpdated', updatedFile); } catch (e) { console.error('❌ Socket emit error:', e.message); }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isDeleted) {
      return res.status(400).json({ message: 'File is not in trash' });
    }

    const organization = await Organization.findById(file.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const member = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isAdmin = member.role === 'admin';
    const isOwner = file.uploader.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only restore your own files' });
    }

    file.isDeleted = false;
    file.deletedAt = null;
    file.deletedBy = null;
    await file.save();

    const updatedFile = await File.findById(file._id).populate('uploader', 'name email');

    res.json(updatedFile);
    // 🔴 Real-time
    const room = `org:${file.organization.toString()}`;
    console.log(`📡 Emitting file:restored to room ${room}`);
    try { getIO().to(room).emit('file:restored', updatedFile); } catch (e) { console.error('❌ Socket emit error:', e.message); }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
