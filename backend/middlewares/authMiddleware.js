const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token safely
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode Supabase JWT (no signature verification)
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Reject expired tokens early
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Find existing MongoDB user by Supabase ID
    let user = await User.findOne({ supabaseId: decoded.sub });

    if (!user) {
      // First authenticated request — create user in MongoDB
      user = await User.create({
        supabaseId: decoded.sub,
        email: decoded.email,
        name: decoded.user_metadata?.name || decoded.email?.split('@')[0] || 'User'
      });

      // Create personal organization ONLY for newly created users
      const personalOrg = await Organization.create({
        name: `${user.name}'s Personal`,
        owner: user._id,
        members: [{
          user: user._id,
          role: 'admin'
        }]
      });

      user.personalOrganization = personalOrg._id;
      await user.save();
    }

    // Attach full Mongo user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
