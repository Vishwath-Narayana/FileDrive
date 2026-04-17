const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');
const crypto = require('crypto');

exports.createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
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

    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    const memberIndex = organization.members.findIndex(
      m => m.user.toString() === userId
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

    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can send invitations' });
    }

    const normalizedEmail = email.toLowerCase();

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
    const invitedUser = await User.findOne({ email: normalizedEmail });
    if (invitedUser) {
      const notification = await Notification.create({
        recipient: invitedUser._id,
        sender: req.user._id,
        message: `You've been invited to join ${organization.name}`,
        type: 'invite',
        orgId: organizationId,
        token: inviteToken
      });

      // Emit real-time notification
      const io = getIO();
      if (io) {
        console.log(`📡 Emitting notification:new to user ${invitedUser._id}`);
        io.emit(`notification:new:${invitedUser._id.toString()}`, notification);
      }
    }

    // Populate for frontend
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('organization', 'name')
      .populate('invitedBy', 'name email');

    res.status(201).json(populatedInvitation);

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

    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
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
    const userEmail = req.user.email.toLowerCase();
    console.log(`📩 Fetching invitations for email: [${userEmail}]`);
    
    const invitations = await Invitation.find({
      email: userEmail,
      status: 'pending'
    })
      .populate('organization', 'name')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${invitations.length} pending invitations`);
    res.json(invitations);
  } catch (error) {
    console.error('❌ Error in getMyInvitations:', error.message);
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

    const organization = await Organization.findById(invitation.organization);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const alreadyMember = organization.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      invitation.status = 'accepted';
      await invitation.save();
      return res.status(400).json({ message: 'You are already a member of this organization' });
    }

    organization.members.push({
      user: req.user._id,
      role: invitation.role
    });

    await organization.save();

    invitation.status = 'accepted';
    await invitation.save();

    const updatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

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

    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can revoke invitations' });
    }

    await Invitation.findByIdAndDelete(invitationId);
    res.json({ message: 'Invitation revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;
    console.log('🔗 POST /accept-invite called with token:', token);

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Look up invitation by token in DB
    const invitation = await Invitation.findOne({ token });
    console.log('🔍 Invitation found:', invitation ? `for ${invitation.email} (status: ${invitation.status})` : 'NOT FOUND');

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid invitation link' });
    }

    // Check if invitation is older than 48 hours
    const hoursSinceCreated = (Date.now() - invitation.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreated > 48) {
      return res.status(400).json({ message: 'Invitation link has expired' });
    }

    const { email, organization: organizationId, role } = invitation;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please register first.',
        needsRegistration: true,
        email,
        organizationId,
        role
      });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if already a member
    const isAlreadyMember = organization.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (invitation.status === 'accepted') {
      if (isAlreadyMember) {
        // Idempotent success (likely the race condition from AuthContext & AcceptInvite)
        const updatedOrg = await Organization.findById(organizationId)
          .populate('owner', 'name email')
          .populate('members.user', 'name email');
          
        return res.json({
          message: 'Invitation accepted successfully',
          organization: updatedOrg
        });
      } else {
        return res.status(400).json({ message: 'Invitation link has expired or been processed already' });
      }
    } else if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Add to organization properly
    if (!isAlreadyMember) {
      console.log(`👤 Adding user ${user._id} to organization ${organizationId} as ${role}`);
      organization.members.push({ user: user._id, role });
      organization.markModified('members');
      await organization.save();
    }

    // Mark as accepted and cleanup
    invitation.status = 'accepted';
    await invitation.save();

    const updatedOrg = await Organization.findById(organizationId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json({
      message: 'Invitation accepted successfully',
      organization: updatedOrg
    });
  } catch (error) {
    console.error('Accept invite by token error:', error);
    res.status(500).json({ message: error.message });
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

    // Delete all files associated with this organization
    const File = require('../models/File');
    await File.deleteMany({ organization: orgId });
    
    await Organization.findByIdAndDelete(orgId);
    await Invitation.deleteMany({ organization: orgId });

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
    const requesterMember = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins/owners can remove members' });
    }

    // Prevent removing the owner
    if (organization.owner.toString() === userId) {
      return res.status(400).json({ message: 'The organization owner cannot be removed' });
    }

    // Prevent removing yourself (if you're an admin but not the owner, use a separate 'Leave' flow if needed, but for now we follow the 'remove' admin logic)
    // Actually, usually admins can remove others. If you want to remove yourself, it's 'Leave'.
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot remove yourself. Use "Leave Organization" instead if available.' });
    }

    const memberIndex = organization.members.findIndex(
      m => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    organization.members.splice(memberIndex, 1);
    organization.markModified('members');
    await organization.save();

    const updatedOrg = await Organization.findById(organizationId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

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
