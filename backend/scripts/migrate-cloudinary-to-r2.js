/**
 * One-off migration: copy existing Cloudinary files (and avatars) into the R2 bucket.
 *
 *   node scripts/migrate-cloudinary-to-r2.js --dry-run   # list what would move
 *   node scripts/migrate-cloudinary-to-r2.js             # do it
 *
 * Needs MONGO_URI and the R2_* variables. Safe to re-run: files that already have a
 * storageKey are skipped, and the Cloudinary originals are never deleted.
 */
require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const { Upload } = require('@aws-sdk/lib-storage');
const { s3, BUCKET, publicUrl } = require('../config/storage');
const File = require('../models/File');
const User = require('../models/User');

const DRY = process.argv.includes('--dry-run');

const copyFromUrl = async (url, key) => {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`GET ${url} -> ${res.status}`);
  await new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: res.body,
      ContentType: res.headers.get('content-type') || undefined,
    },
  }).done();
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const files = await File.find({ storageKey: { $in: [null, undefined, ''] }, path: /^https?:\/\// });
  console.log(`${files.length} file(s) to migrate${DRY ? ' (dry run)' : ''}`);
  let ok = 0;
  let failed = 0;
  for (const f of files) {
    const ext = path.extname(f.originalName || '').slice(0, 12).replace(/[^.\w]/g, '');
    const key = `orgs/${f.organization}/${crypto.randomUUID()}${ext}`;
    try {
      if (!DRY) {
        await copyFromUrl(f.path, key);
        await File.updateOne({ _id: f._id }, { storageKey: key, path: key, filename: key });
      }
      ok++;
      console.log(`${DRY ? 'would copy' : 'copied'} ${f.originalName} -> ${key}`);
    } catch (e) {
      failed++;
      console.error(`FAILED ${f._id} (${f.originalName}): ${e.message}`);
    }
  }

  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  const users = await User.find({ avatar: /^https?:\/\// });
  const legacyAvatars = users.filter((u) => !base || !u.avatar.startsWith(base));
  console.log(`${legacyAvatars.length} avatar(s) to migrate`);
  for (const u of legacyAvatars) {
    if (!base) {
      console.warn('R2_PUBLIC_URL not set: skipping avatars');
      break;
    }
    const key = `avatars/${u._id}-${Date.now()}${path.extname(new URL(u.avatar).pathname) || '.jpg'}`;
    try {
      if (!DRY) {
        await copyFromUrl(u.avatar, key);
        await User.updateOne({ _id: u._id }, { avatar: publicUrl(key) });
      }
      console.log(`${DRY ? 'would copy' : 'copied'} avatar of ${u.email}`);
    } catch (e) {
      console.error(`FAILED avatar ${u.email}: ${e.message}`);
    }
  }

  console.log(`Done. files ok=${ok} failed=${failed}`);
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
