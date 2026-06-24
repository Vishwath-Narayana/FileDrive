const mongoose = require('mongoose');

const getFileType = (mimetype, originalname = '') => {
  const ext = originalname.split('.').pop().toLowerCase();
  if (mimetype?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'heic', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    mimetype === 'text/csv' ||
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.oasis.opendocument.spreadsheet' ||
    ['csv', 'xls', 'xlsx', 'ods', 'tsv'].includes(ext)
  ) {
    return 'spreadsheet';
  }
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
  if (
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimetype === 'application/vnd.oasis.opendocument.presentation' ||
    ['ppt', 'pptx', 'odp', 'key'].includes(ext)
  ) {
    return 'presentation';
  }
  if (mimetype?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', '3gp'].includes(ext)) {
    return 'video';
  }
  if (mimetype?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
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

const runMigration = async () => {
  try {
    const File = mongoose.model('File');
    const files = await File.find({});
    let updatedCount = 0;
    
    for (const file of files) {
      const correctType = getFileType(file.mimetype || '', file.originalName || '');
      if (file.fileType !== correctType) {
        file.fileType = correctType;
        await file.save();
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      console.log(`✅ [Migration] Successfully updated ${updatedCount} file records to the new classification system.`);
    } else {
      console.log('ℹ️ [Migration] All files are already categorized correctly.');
    }
  } catch (err) {
    console.error('❌ [Migration] Error running database migration:', err.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    
    // Run the migration asynchronously so server start isn't blocked
    runMigration();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
