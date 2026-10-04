const File = require('../models/File');
const Organization = require('../models/Organization');
const { getObjectUrl, deleteObject } = require('../config/storage');
const { emitToOrg } = require('../socket');
const { getFileType } = require('../utils/fileType');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Returns the caller's membership entry for an org, or null.
const getMembership = async (organizationId, userId) => {
  const org = await Organization.findById(organizationId).select('members');
  if (!org) return { org: null, member: null };
  const member = org.members.find((m) => m.user.toString() === userId.toString()) || null;
  return { org, member };
};

// Load a file and make sure the caller belongs to its organization.
// Sends the error response itself and returns null when access is not allowed.
const loadFileForMember = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) {
    res.status(404).json({ message: 'File not found' });
    return null;
  }
  const { org, member } = await getMembership(file.organization, req.user._id);
  if (!org) {
    res.status(404).json({ message: 'Organization not found' });
    return null;
  }
  if (!member) {
    res.status(403).json({ message: 'Access denied' });
    return null;
  }
  return { file, member };
};

exports.uploadFile = async (req, res) => {
  // authorizeUpload already checked membership/role; the object is in the bucket by now.
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = await File.create({
      filename: req.file.key,
      originalName: req.file.originalname,
      path: req.file.key,
      storageKey: req.file.key,
      format: req.file.originalname.includes('.') ? req.file.originalname.split('.').pop().toLowerCase() : undefined,
      size: req.file.size,
      fileType: getFileType(req.file.mimetype, req.file.originalname),
      uploader: req.user._id,
      organization: req.uploadOrgId,
    });

    const populatedFile = await File.findById(file._id).populate('uploader', 'name email');
    res.status(201).json(populatedFile);
    emitToOrg(req.uploadOrgId, 'file:new', populatedFile);
  } catch (error) {
    console.error('Upload file error:', error);
    // Do not leave an orphaned object behind when the DB write fails.
    if (req.file?.key) deleteObject(req.file.key).catch(() => {});
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { search, type, organizationId, filter } = req.query;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const { org, member } = await getMembership(organizationId, req.user._id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const query = { organization: organizationId };

    if (filter === 'favorites') {
      query.favoritedBy = req.user._id;
      query.isDeleted = false;
    } else if (filter === 'trash') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }

    if (search) {
      query.originalName = { $regex: escapeRegex(String(search).slice(0, 100)), $options: 'i' };
    }

    if (type && type !== 'all') {
      query.fileType = type === 'spreadsheet' ? { $in: ['spreadsheet', 'csv'] } : String(type);
    }

    const files = await File.find(query)
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Failed to load files' });
  }
};

const signedUrlFor = async (file, disposition) => {
  if (!file.storageKey) {
    const err = new Error('This file has not been migrated to the new storage yet');
    err.status = 409;
    throw err;
  }
  return getObjectUrl(file.storageKey, { filename: file.originalName, disposition });
};

exports.downloadFile = async (req, res) => {
  try {
    const loaded = await loadFileForMember(req, res);
    if (!loaded) return;
    res.json({ downloadUrl: await signedUrlFor(loaded.file, 'attachment') });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to create download link' });
  }
};

exports.viewFile = async (req, res) => {
  try {
    const loaded = await loadFileForMember(req, res);
    if (!loaded) return;
    res.json({ viewUrl: await signedUrlFor(loaded.file, 'inline') });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error('View error:', error);
    res.status(500).json({ message: 'Failed to create preview link' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const loaded = await loadFileForMember(req, res);
    if (!loaded) return;
    const { file, member } = loaded;

    const isAdmin = member.role === 'admin';
    const isOwner = file.uploader.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own files' });
    }

    const room = file.organization.toString();

    if (file.isDeleted) {
      // Remove the DB record first so a storage hiccup cannot leave a dangling record.
      await File.findByIdAndDelete(file._id);
      await deleteObject(file.storageKey).catch((e) => console.error('Storage delete failed:', file.storageKey, e.message));
      res.json({ message: 'File permanently deleted' });
      emitToOrg(room, 'file:deleted', { fileId: req.params.id });
    } else {
      file.isDeleted = true;
      file.deletedAt = new Date();
      file.deletedBy = req.user._id;
      await file.save();
      res.json({ message: 'File moved to trash' });
      emitToOrg(room, 'file:trashed', { fileId: req.params.id });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const loaded = await loadFileForMember(req, res);
    if (!loaded) return;
    const { file } = loaded;

    const userId = req.user._id.toString();
    const isFavorited = file.favoritedBy.some((id) => id.toString() === userId);

    // Atomic update avoids lost writes when two members favorite at once.
    await File.updateOne(
      { _id: file._id },
      isFavorited ? { $pull: { favoritedBy: req.user._id } } : { $addToSet: { favoritedBy: req.user._id } }
    );

    const updatedFile = await File.findById(file._id).populate('uploader', 'name email');
    res.json(updatedFile);
    emitToOrg(file.organization.toString(), 'file:favoriteUpdated', updatedFile);
  } catch (error) {
    console.error('Favorite error:', error);
    res.status(500).json({ message: 'Failed to update favorite' });
  }
};

exports.restoreFile = async (req, res) => {
  try {
    const loaded = await loadFileForMember(req, res);
    if (!loaded) return;
    const { file, member } = loaded;

    if (!file.isDeleted) {
      return res.status(400).json({ message: 'File is not in trash' });
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
    emitToOrg(file.organization.toString(), 'file:restored', updatedFile);
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ message: 'Failed to restore file' });
  }
};
