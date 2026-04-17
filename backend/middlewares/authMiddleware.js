const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token safely
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ No token in header');
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode Supabase JWT (no signature verification)
    const decoded = jwt.decode(token);
    console.log('🔑 Decoded token:', decoded ? { sub: decoded.sub, email: decoded.email } : 'FAILED');

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Reject expired tokens early
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log('⏰ Token expired');
      return res.status(401).json({ message: 'Token expired' });
    }

    // Find existing MongoDB user by Supabase ID
    console.log('🔍 Looking up user with supabaseId:', decoded.sub);
    let user = await User.findOne({ supabaseId: decoded.sub });

    if (!user && decoded.email) {
      // 🔄 MIGRATION: Search for user by email if not found by supabaseId
      console.log('🔍 User not found by supabaseId, searching by email:', decoded.email);
      user = await User.findOne({ email: decoded.email.toLowerCase() });
      
      if (user) {
        console.log('✅ Found legacy user by email, linking to supabaseId:', decoded.sub);
        user.supabaseId = decoded.sub;
        await user.save();
      }
    }

    if (!user) {
      if (!decoded.email) {
        console.log('❌ No email in token — cannot create user');
        return res.status(400).json({ message: 'Email is required in token' });
      }

      // ➕ First authenticated request — create new user in MongoDB
      console.log('➕ Creating new user...');
      user = await User.create({
        supabaseId: decoded.sub,
        email: decoded.email.toLowerCase(),
        name: decoded.user_metadata?.name || decoded.email.split('@')[0] || 'User'
      });
      console.log('✅ User created:', user._id);

      // 🏢 Create personal organization ONLY for newly created users
      const personalOrg = await Organization.create({
        name: `${user.name}'s Personal`,
        owner: user._id,
        members: [{
          user: user._id,
          role: 'admin'
        }]
      });
      console.log('✅ Personal org created:', personalOrg._id);

      user.personalOrganization = personalOrg._id;
      await user.save();

      // 🔥 RETROACTIVE LOGIC: Find any pending invites and generate notifications
      try {
        const pendingInvites = await Invitation.find({ email: user.email, status: 'pending' }).populate('organization');
        for (const invite of pendingInvites) {
          const orgName = invite.organization ? invite.organization.name : 'an organization';
          await Notification.create({
            recipient: user._id,
            sender: invite.invitedBy,
            message: `You've been invited to join ${orgName}`,
            type: 'invite',
            orgId: invite.organization ? invite.organization._id : null,
            token: invite.token
          });
        }
        console.log(`✅ Created ${pendingInvites.length} retroactive notifications for new user`);
      } catch (err) {
        console.error('⚠️ Failed to create retroactive notifications:', err.message);
      }
    }

    // Attach full Mongo user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('💥 Auth middleware CRASH:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
