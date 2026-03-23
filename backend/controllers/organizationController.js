const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendInviteEmail } = require('../utils/email');

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

    // 🔐 Generate token
    const jwtToken = jwt.sign(
      { email: normalizedEmail, organizationId, role },
      process.env.JWT_SECRET,
      { expiresIn: '48h' }
    );

    // 🔗 Invite link
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${jwtToken}`;

    // 💾 Save invitation
    const invitation = await Invitation.create({
      organization: organizationId,
      email: normalizedEmail,
      role,
      invitedBy: req.user._id,
      token: jwtToken
    });

    // 🔍 Populate for frontend
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('organization', 'name')
      .populate('invitedBy', 'name email');

    // ⚡ SEND RESPONSE FIRST (FAST UI)
    res.status(201).json(populatedInvitation);

    // 🚀 Send email in background (NO await)
    sendInviteEmail(normalizedEmail, inviteLink, role, organization.name, req.user.name, req.user.email)
      .then(() => {
        console.log("Invite email sent to:", normalizedEmail);
      })
      .catch(err => {
        console.error("Email failed:", err.message);
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

exports.acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired invitation link' });
    }

    const { email, organizationId, role } = decoded;

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

    const alreadyMember = organization.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this organization' });
    }

    organization.members.push({
      user: user._id,
      role
    });

    await organization.save();

    await Invitation.updateOne(
      { organization: organizationId, email: email.toLowerCase(), status: 'pending' },
      { status: 'accepted' }
    );

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
