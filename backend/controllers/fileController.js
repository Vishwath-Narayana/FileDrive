const File = require('../models/File');
const Organization = require('../models/Organization');
const { cloudinary } = require('../config/cloudinaryConfig');
const { getIO } = require('../socket');

const getFileType = (mimetype, originalname = '') => {
  const ext = originalname.split('.').pop().toLowerCase();

  // Images
  if (mimetype?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'heic', 'bmp'].includes(ext)) {
    return 'image';
  }
  
  // PDFs
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  
  // Spreadsheets
  if (
    mimetype === 'text/csv' ||
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.oasis.opendocument.spreadsheet' ||
    ['csv', 'xls', 'xlsx', 'ods', 'tsv'].includes(ext)
  ) {
    return 'spreadsheet';
  }

  // Documents
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype?.startsWith('text/plain') ||
    mimetype === 'application/rtf' ||
    mimetype === 'application/vnd.oasis.opendocument.text' ||
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'md', 'pages'].includes(ext)
  ) {
    return 'document';
  }

  // Presentations
  if (
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimetype === 'application/vnd.oasis.opendocument.presentation' ||
    ['ppt', 'pptx', 'odp', 'key'].includes(ext)
  ) {
    return 'presentation';
  }

  // Videos
  if (mimetype?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', '3gp'].includes(ext)) {
    return 'video';
  }

  // Audio
  if (mimetype?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }

  // Archives
  if (
    mimetype === 'application/zip' ||
    mimetype === 'application/x-rar-compressed' ||
    mimetype === 'application/x-7z-compressed' ||
    mimetype === 'application/x-tar' ||
    mimetype === 'application/gzip' ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)
  ) {
    return 'archive';
  }

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

    const fileType = getFileType(req.file.mimetype, req.file.originalname);

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
      if (type === 'spreadsheet') {
        query.fileType = { $in: ['spreadsheet', 'csv'] };
      } else {
        query.fileType = type;
      }
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

exports.viewFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Determine actual resource type from stored path
    let resourceType = file.resourceType;
    if (!resourceType || resourceType === 'auto') {
      if (file.path.includes('/image/upload/')) resourceType = 'image';
      else if (file.path.includes('/raw/upload/')) resourceType = 'raw';
      else if (file.path.includes('/video/upload/')) resourceType = 'video';
    }

    const format = file.format || file.originalName.split('.').pop().toLowerCase();

    // Generate a signed URL for INLINE viewing (attachment: false)
    const viewUrl = cloudinary.utils.private_download_url(file.cloudinaryPublicId, format, {
      resource_type: resourceType || 'auto',
      type: 'upload',
      attachment: false // 🔥 Key difference: no forced download
    });

    res.json({ viewUrl });
  } catch (error) {
    console.error("VIEW ERROR:", error);
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
