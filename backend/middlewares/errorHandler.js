const multer = require('multer');

const notFound = (req, res) => res.status(404).json({ message: 'Route not found' });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
    return res.status(status).json({ message });
  }
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled error:', err);
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : err.message });
};

module.exports = { notFound, errorHandler };
