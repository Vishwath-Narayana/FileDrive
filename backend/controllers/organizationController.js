const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const File = require('../models/File');
const { emitToUser, emitToOrg, removeUserFromOrgRoom, closeOrgRoom } = require('../socket');
const { deleteObjects } = require('../config/storage');
const crypto = require('crypto');

// Must match the TTL index on the Invitation model (24h) so links never "work" after Mongo purges them.
const INVITE_TTL_HOURS = 24;

const populateOrg = (id) =>
  Organization.findById(id).populate('owner', 'name email').populate('members.user', 'name email');

exports.createOrganization = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name || name.length > 80) {
      return res.status(400).json({ message: 'Organization name is required (max 80 characters)' });
    }

    const organization = await Organization.create({
      name,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    const populatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(201).json(populatedOrg);
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({
      'members.user': req.user._id
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = organization.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { organizationId, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Allow owner to update roles, or explicitly an admin
    const isOwner = organization.owner.toString() === req.user._id.toString();
    const requesterMember = organization.members.find(
      m => m.user && m.user.toString() === req.user._id.toString()
    );

    if (!isOwner && (!requesterMember || requesterMember.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins and owners can change roles' });
    }

    // Prevent modifying the owner's role
    if (organization.owner.toString() === userId) {
      return res.status(400).json({ message: "The organization owner's role cannot be changed" });
    }

    const memberIndex = organization.members.findIndex(
      m => m.user && m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    organization.members[memberIndex].role = role;
    organization.markModified('members');
    await organization.save();

    const updatedOrg = await Organization.findById(organizationId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    emitToOrg(organizationId, 'org:updated', updatedOrg);

    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendInvitation = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isOwner = organization.owner?.toString() === req.user._id.toString();
    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isOwner && (!requesterMember || requesterMember.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins can send invitations' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && organization.members.some((m) => m.user.toString() === existingUser._id.toString())) {
      return res.status(400).json({ message: 'This user is already a member' });
    }

    const existingInvitation = await Invitation.findOne({
      organization: organizationId,
      email: normalizedEmail,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }

    // Generate a random token (no JWT)
    const inviteToken = crypto.randomUUID();

    // Invite link
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${inviteToken}`;

    // Save invitation with metadata stored in DB
    const invitation = await Invitation.create({
      organization: organizationId,
      email: normalizedEmail,
      role,
      invitedBy: req.user._id,
      token: inviteToken
    });

    // 🔴 Real-time: check if user exists in MongoDB to notify them in-app
    const invitedUser = existingUser;
    if (invitedUser) {
      const notification = await Notification.create({
        recipient: invitedUser._id,
        sender: req.user._id,
        message: `You've been invited to join ${organization.name}`,
        type: 'invite',
        orgId: organizationId,
        token: inviteToken,
        status: 'unread'
      });

      // Only the invited user's own sockets receive this (was a broadcast to every client)
      emitToUser(invitedUser._id.toString(), 'notification:new', notification);
    }

    // Populate for frontend
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('organization', 'name')
      .populate('invitedBy', 'name email');

    res.status(201).json({ 
      ...populatedInvitation.toObject(), 
      token: inviteToken 
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrganizationInvitations = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isOwner = organization.owner?.toString() === req.user._id.toString();
    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isOwner && (!requesterMember || requesterMember.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins can view invitations' });
    }

    const invitations = await Invitation.find({
      organization: organizationId
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email,
      status: 'pending'
    })
      .populate('organization', 'name')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.email !== req.user.email) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Claim the invitation atomically so a double click / two tabs cannot join twice.
    const claimed = await Invitation.findOneAndUpdate(
      { _id: invitation._id, status: 'pending' },
      { status: 'accepted' }
    );
    if (!claimed) {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    const joined = await Organization.updateOne(
      { _id: invitation.organization, 'members.user': { $ne: req.user._id } },
      { $push: { members: { user: req.user._id, role: invitation.role } } }
    );
    if (joined.matchedCount === 0) {
      const exists = await Organization.exists({ _id: invitation.organization });
      return res.status(exists ? 400 : 404).json({
        message: exists ? 'You are already a member of this organization' : 'Organization not found'
      });
    }

    const updatedOrg = await populateOrg(invitation.organization);
    emitToOrg(invitation.organization.toString(), 'org:updated', updatedOrg);

    res.json({
      message: 'Invitation accepted successfully',
      organization: updatedOrg
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.email !== req.user.email) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin can revoke/delete any invitation
exports.revokeInvitation = async (req, res) => {
  try {
    const { organizationId, invitationId } = req.params;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isOwner2 = organization.owner?.toString() === req.user._id.toString();
    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!isOwner2 && (!requesterMember || requesterMember.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins can revoke invitations' });
    }

    // Scoped to this organization: an admin of org A must not delete org B's invitations.
    const deleted = await Invitation.findOneAndDelete({ _id: invitationId, organization: organizationId });
    if (!deleted) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    res.json({ message: 'Invitation revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Route is authenticated: the token only works for the account it was issued to.
    const invitation = await Invitation.findOne({ token, status: 'pending' });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation link' });
    }

    const hoursSinceCreated = (Date.now() - invitation.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreated > INVITE_TTL_HOURS) {
      return res.status(400).json({ message: 'Invitation link has expired' });
    }

    if (invitation.email !== req.user.email) {
      return res.status(403).json({ message: `This invitation was sent to ${invitation.email}. Sign in with that email to accept it.` });
    }

    const claimed = await Invitation.findOneAndUpdate(
      { _id: invitation._id, status: 'pending' },
      { status: 'accepted' }
    );
    if (!claimed) {
      return res.status(400).json({ message: 'Invalid or expired invitation link' });
    }

    const organizationId = invitation.organization;
    const joined = await Organization.updateOne(
      { _id: organizationId, 'members.user': { $ne: req.user._id } },
      { $push: { members: { user: req.user._id, role: invitation.role } } }
    );
    if (joined.matchedCount === 0 && !(await Organization.exists({ _id: organizationId }))) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const updatedOrg = await populateOrg(organizationId);
    emitToOrg(organizationId.toString(), 'org:updated', updatedOrg);

    res.json({
      message: 'Invitation accepted successfully',
      organization: updatedOrg
    });
  } catch (error) {
    console.error('Accept invite by token error:', error);
    res.status(500).json({ message: 'Failed to accept invitation' });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const orgId = req.params.id;
    const organization = await Organization.findById(orgId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete the organization' });
    }

    if (req.user.personalOrganization && req.user.personalOrganization.toString() === orgId) {
      return res.status(400).json({ message: 'Cannot delete your personal organization' });
    }

    // Remove stored objects first (otherwise they are orphaned and keep costing money)
    const files = await File.find({ organization: orgId }).select('storageKey');
    await deleteObjects(files.map((f) => f.storageKey)).catch((e) => console.error('Org storage cleanup failed:', e.message));

    await File.deleteMany({ organization: orgId });
    await Organization.findByIdAndDelete(orgId);
    await Invitation.deleteMany({ organization: orgId });
    await Notification.deleteMany({ orgId });

    emitToOrg(orgId, 'org:deleted', { orgId });
    closeOrgRoom(orgId);

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { organizationId, userId } = req.params;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if the requester is an admin or owner
    const isOwner = organization.owner?.toString() === req.user._id.toString();
    const requesterMember = organization.members.find(
      m => m.user && m.user.toString() === req.user._id.toString()
    );

    if (!isOwner && (!requesterMember || requesterMember.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins/owners can remove members' });
    }

    // Prevent removing the owner
    if (organization.owner?.toString() === userId) {
      return res.status(400).json({ message: 'The organization owner cannot be removed' });
    }

    // Prevent removing yourself (if you're an admin but not the owner, use a separate 'Leave' flow if needed, but for now we follow the 'remove' admin logic)
    // Actually, usually admins can remove others. If you want to remove yourself, it's 'Leave'.
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot remove yourself. Use "Leave Organization" instead if available.' });
    }

    const initialLength = organization.members.length;
    organization.members = organization.members.filter(
      m => m.user && m.user.toString() !== userId
    );

    if (organization.members.length === initialLength) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    organization.markModified('members');
    await organization.save();

    const updatedOrg = await Organization.findById(organizationId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    emitToOrg(organizationId, 'org:updated', updatedOrg);
    // The removed member got the update above; now stop any further org events reaching them.
    removeUserFromOrgRoom(userId, organizationId);

    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { status: 'read' }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
