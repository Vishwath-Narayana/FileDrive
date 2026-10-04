const { S3Client, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Cloudflare R2 speaks the S3 API. Any S3-compatible store works by changing R2_ENDPOINT.
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;

const contentDisposition = (type, filename) =>
  `${type}; filename*=UTF-8''${encodeURIComponent(filename).replace(/['()]/g, escape)}`;

// Short-lived signed URL. `inline` for preview, `attachment` for download.
const getObjectUrl = (key, { filename, disposition = 'attachment', expiresIn = 300 } = {}) =>
  getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: filename ? contentDisposition(disposition, filename) : undefined,
    }),
    { expiresIn }
  );

const deleteObject = async (key) => {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

const deleteObjects = async (keys) => {
  const list = keys.filter(Boolean);
  for (let i = 0; i < list.length; i += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: list.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
      })
    );
  }
};

// Avatars live under avatars/ and are served from a public bucket domain.
const publicUrl = (key) => {
  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  return base ? `${base}/${key}` : null;
};

module.exports = { s3, BUCKET, getObjectUrl, deleteObject, deleteObjects, publicUrl };
