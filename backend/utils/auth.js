const { createRemoteJWKSet, jwtVerify, decodeProtectedHeader } = require('jose');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ISSUER = `${SUPABASE_URL}/auth/v1`;

let jwks;
const getJwks = () => {
  if (!jwks) jwks = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`), { cooldownDuration: 30_000 });
  return jwks;
};

/**
 * Verify a Supabase access token signature, issuer, audience and expiry.
 * Newer Supabase projects sign with asymmetric keys (JWKS); older ones use the
 * shared HS256 secret (SUPABASE_JWT_SECRET). The key is chosen from the token's
 * alg header and the allowed algorithms are pinned, so a token cannot pick its own.
 */
const verifyAccessToken = async (token) => {
  const { alg } = decodeProtectedHeader(token);
  const options = { issuer: ISSUER, audience: 'authenticated' };

  if (alg === 'HS256') {
    if (!process.env.SUPABASE_JWT_SECRET) throw new Error('HS256 token but SUPABASE_JWT_SECRET is not set');
    const key = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
    return (await jwtVerify(token, key, { ...options, algorithms: ['HS256'] })).payload;
  }
  return (await jwtVerify(token, getJwks(), { ...options, algorithms: ['ES256', 'RS256'] })).payload;
};

let admin;
const getSupabaseAdmin = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!admin) {
    admin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return admin;
};

// Cache "does this user have a verified TOTP factor" for a minute.
const mfaCache = new Map();
const MFA_TTL_MS = 60_000;
let warnedNoServiceKey = false;

const userHasMfa = async (userId) => {
  const cached = mfaCache.get(userId);
  if (cached && cached.exp > Date.now()) return cached.value;

  const client = getSupabaseAdmin();
  if (!client) {
    if (!warnedNoServiceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set: 2FA is NOT enforced server-side');
      warnedNoServiceKey = true;
    }
    return false;
  }

  const { data, error } = await client.auth.admin.mfa.listFactors({ userId });
  if (error) throw error; // fail closed
  const value = (data?.factors || []).some((f) => f.status === 'verified');
  mfaCache.set(userId, { value, exp: Date.now() + MFA_TTL_MS });
  return value;
};

/** True when the user enrolled 2FA but this session has not passed the second step. */
const needsMfaUpgrade = async (payload) => {
  if (payload.aal === 'aal2') return false;
  return userHasMfa(payload.sub);
};

module.exports = { verifyAccessToken, needsMfaUpgrade };
