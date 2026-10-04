const User = require('../models/User');
const Organization = require('../models/Organization');
const { verifyAccessToken, needsMfaUpgrade } = require('../utils/auth');

// Find the Mongo user for a verified Supabase token, creating it (and a personal org) on first sight.
const resolveUser = async (payload, { create = true } = {}) => {
  const email = payload.email?.toLowerCase();
  let user = await User.findOne({ supabaseId: payload.sub });
  if (user || !create) return user;

  // Legacy accounts: link by email, but only when Supabase says the email is verified.
  // Otherwise someone could sign up with a victim's address and take over their account.
  if (email && payload.user_metadata?.email_verified === true) {
    user = await User.findOne({ email });
    if (user) {
      user.supabaseId = payload.sub;
      await user.save();
      return user;
    }
  }

  if (!email) {
    const err = new Error('Email is required in token');
    err.status = 400;
    throw err;
  }

  try {
    user = await User.create({
      supabaseId: payload.sub,
      email,
      name: payload.user_metadata?.name || email.split('@')[0] || 'User',
    });
  } catch (e) {
    if (e.code === 11000) {
      // Two first requests raced, or the email belongs to an unlinked account.
      user = await User.findOne({ supabaseId: payload.sub });
      if (user) return user;
      const err = new Error('An account with this email already exists. Verify your email, then sign in again.');
      err.status = 409;
      throw err;
    }
    throw e;
  }

  const personalOrg = await Organization.create({
    name: `${user.name}'s Personal`,
    owner: user._id,
    members: [{ user: user._id, role: 'admin' }],
  });
  user.personalOrganization = personalOrg._id;
  await user.save();
  return user;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch (e) {
      const expired = e.code === 'ERR_JWT_EXPIRED';
      return res.status(401).json({ message: expired ? 'Token expired' : 'Invalid token', code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID' });
    }

    if (await needsMfaUpgrade(payload)) {
      return res.status(401).json({ message: 'Two-factor verification required', code: 'MFA_REQUIRED' });
    }

    req.user = await resolveUser(payload);
    req.auth = { aal: payload.aal, sessionId: payload.session_id };
    next();
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
module.exports.resolveUser = resolveUser;
