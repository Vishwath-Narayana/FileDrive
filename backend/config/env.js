// Fail fast on missing configuration instead of crashing on the first request.
const required = [
  'MONGO_URI',
  'SUPABASE_URL',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'FRONTEND_URL',
];

// Needed in production so 2FA can be enforced server-side.
const requiredInProduction = ['SUPABASE_SERVICE_ROLE_KEY'];

const validateEnv = () => {
  const missing = required.filter((k) => !process.env[k]);
  if (process.env.NODE_ENV === 'production') {
    missing.push(...requiredInProduction.filter((k) => !process.env[k]));
  }
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

// FRONTEND_URL may hold several comma-separated origins (prod + preview).
const allowedOrigins = () =>
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

const primaryFrontendUrl = () => allowedOrigins()[0] || '';

module.exports = { validateEnv, allowedOrigins, primaryFrontendUrl };
