const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateMemberRole,
  sendInvitation,
  getOrganizationInvitations,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  acceptInviteByToken
} = require('../controllers/organizationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createOrganization);
router.get('/', authMiddleware, getMyOrganizations);
router.get('/invitations/me', authMiddleware, getMyInvitations);
router.get('/:id', authMiddleware, getOrganizationById);
router.put('/:organizationId/members/:userId/role', authMiddleware, updateMemberRole);
router.post('/:organizationId/invitations', authMiddleware, sendInvitation);
router.get('/:organizationId/invitations', authMiddleware, getOrganizationInvitations);
router.post('/invitations/:invitationId/accept', authMiddleware, acceptInvitation);
router.post('/invitations/:invitationId/reject', authMiddleware, rejectInvitation);
router.post('/accept-invite', acceptInviteByToken);

module.exports = router;
