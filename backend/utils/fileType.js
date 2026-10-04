const EXT = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'heic', 'bmp'],
  spreadsheet: ['csv', 'xls', 'xlsx', 'ods', 'tsv'],
  document: ['doc', 'docx', 'txt', 'rtf', 'odt', 'md', 'pages'],
  presentation: ['ppt', 'pptx', 'odp', 'key'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', '3gp'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
};

const MIME = {
  spreadsheet: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
  ],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
  ],
  presentation: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation',
  ],
  archive: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ],
};

const getFileType = (mimetype = '', originalname = '') => {
  const ext = originalname.includes('.') ? originalname.split('.').pop().toLowerCase() : '';
  const is = (kind) => EXT[kind].includes(ext) || (MIME[kind] || []).includes(mimetype);

  if (mimetype.startsWith('image/') || EXT.image.includes(ext)) return 'image';
  if (mimetype === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (is('spreadsheet')) return 'spreadsheet';
  if (is('document') || mimetype.startsWith('text/plain')) return 'document';
  if (is('presentation')) return 'presentation';
  if (mimetype.startsWith('video/') || EXT.video.includes(ext)) return 'video';
  if (mimetype.startsWith('audio/') || EXT.audio.includes(ext)) return 'audio';
  if (is('archive')) return 'archive';
  return 'other';
};

module.exports = { getFileType };
