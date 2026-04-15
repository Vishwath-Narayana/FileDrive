import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { Mail, UserPlus, X, ChevronDown, Trash2, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

/* Role badge helper */
const RoleBadge = ({ role }) => (
  <span className={`role-badge role-badge-${role}`}>
    {role.charAt(0).toUpperCase() + role.slice(1)}
  </span>
);

const ManageOrgModal = ({ show, onHide }) => {
  const { user, currentOrganization, refreshOrganizations, switchOrganization, organizations } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deletingOrg, setDeletingOrg] = useState(false);
  const [inviteRole, setInviteRole] = useState('viewer');
  const [sending, setSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmOrgName, setConfirmOrgName] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);

  useEffect(() => {
    if (show && currentOrganization) {
      fetchOrganizationData();
      setInviteSuccess(null);
    }
  }, [show, currentOrganization]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      const [orgResponse, invitationsResponse] = await Promise.all([
        api.get(`/organizations/${currentOrganization._id}`),
        api.get(`/organizations/${currentOrganization._id}/invitations`)
      ]);
      setMembers(orgResponse.data.members || []);
      setInvitations(invitationsResponse.data || []);
    } catch (error) {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberConfirm(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await api.delete(`/organizations/${currentOrganization._id}/members/${memberToRemove.user?._id || memberToRemove.user}`);
      toast.success('Member removed successfully');
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);
      await fetchOrganizationData();
      await refreshOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/organizations/${currentOrganization._id}/members/${userId}/role`, { role: newRole });
      toast.success('Role updated successfully');
      await fetchOrganizationData();
      await refreshOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setSending(true);
      const response = await api.post(`/organizations/${currentOrganization._id}/invitations`, {
        email: inviteEmail,
        role: inviteRole
      });

      const token = response.data.token;
      const inviteLink = `${window.location.origin}/accept-invite?token=${token}`;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          emailRedirectTo: inviteLink,
          shouldCreateUser: true
        }
      });

      if (otpError) {
        console.warn('Supabase OTP error (non-fatal):', otpError.message);
      }

      setInviteSuccess({ email: inviteEmail });
      toast.success('Invitation email sent!');
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteForm(false);
      await fetchOrganizationData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    try {
      await api.delete(`/organizations/${currentOrganization._id}/invitations/${invitationId}`);
      toast.success('Invitation revoked');
      await fetchOrganizationData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke invitation');
    }
  };

  const handleDeleteOrganization = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOrganization = async () => {
    if (confirmOrgName !== currentOrganization.name) {
      toast.error('Organization name does not match');
      return;
    }

    try {
      setDeletingOrg(true);
      await api.delete(`/organizations/${currentOrganization._id}`);
      toast.success('Organization deleted successfully');

      localStorage.removeItem('currentOrganization');
      await refreshOrganizations();

      const remainingOrgs = organizations.filter(o => o._id !== currentOrganization._id);
      const fallback =
        remainingOrgs.find(o => o._id === user?.personalOrganization?.toString()) ||
        remainingOrgs.find(o => o._id === user?.personalOrganization) ||
        remainingOrgs[0];

      if (fallback) {
        switchOrganization(fallback);
      }

      setShowDeleteConfirm(false);
      setConfirmOrgName('');
      onHide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    } finally {
      setDeletingOrg(false);
    }
  };

  const isOwner =
    currentOrganization?.owner?.toString() === user?._id?.toString() ||
    currentOrganization?.owner?._id?.toString() === user?._id?.toString();
  const isPersonal =
    user?.personalOrganization?.toString() === currentOrganization?._id?.toString();

  /* ── Style helpers ── */
  const modalBody = {
    background: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '1px solid var(--border)',
  };

  const memberRowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '44px', padding: '0 8px',
    borderRadius: '6px', transition: 'background 100ms ease',
    cursor: 'default',
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="premium-modal">
      <style>{`
        @media (max-width: 640px) {
          .manage-org-sheet {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 16px 16px 0 0 !important;
            max-height: 85vh;
            overflow-y: auto;
            margin: 0 !important;
          }
        }
      `}</style>
      <div className="manage-org-sheet" style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #E8E8E6',
        maxWidth: '520px',
        width: '90vw',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Manage organization
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {currentOrganization?.name}
            </p>
          </div>
          <button
            onClick={onHide}
            style={{
              width: '28px', height: '28px', borderRadius: '6px',
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-tertiary)', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Invite success banner */}
        {inviteSuccess && (
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 14px', marginBottom: '16px',
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px',
            }}
          >
            <Mail size={15} style={{ color: '#22C55E', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#15803D', margin: 0 }}>Invitation sent!</p>
              <p style={{ fontSize: '12px', color: '#166534', margin: '2px 0 0' }}>
                A magic link was emailed to <strong>{inviteSuccess.email}</strong>. They'll join automatically after clicking it.
              </p>
            </div>
            <button onClick={() => setInviteSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        )}

        <Tabs defaultActiveKey="members" className="premium-tabs mb-5 border-b border-[--border]">
          {/* ── Members Tab ── */}
          <Tab eventKey="members" title="Members" className="pt-2">
            <div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '44px' }}>
                      <div className="skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton-shimmer" style={{ height: '13px', width: '100px', borderRadius: '4px', marginBottom: '4px' }} />
                        <div className="skeleton-shimmer" style={{ height: '11px', width: '150px', borderRadius: '4px' }} />
                      </div>
                      <div className="skeleton-shimmer" style={{ height: '22px', width: '60px', borderRadius: '4px' }} />
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-tertiary)' }}>No members found</p>
              ) : (
                members.filter(m => m.user).map((member) => (
                  <div
                    key={member.user?._id || member.user}
                    style={memberRowStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#E8E8E6', color: 'var(--text-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 500, flexShrink: 0,
                        }}
                      >
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {member.user?.name || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {member.user?.email || ''}
                        </div>
                      </div>
                    </div>

                    {/* Role + actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="link"
                          size="sm"
                          className="text-decoration-none p-0 border-0 bg-transparent"
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          >
                            <RoleBadge role={member.role} />
                            <ChevronDown size={11} style={{ color: 'var(--text-tertiary)' }} />
                          </div>
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                          className="shadow-lg py-1"
                          style={{
                            border: '1px solid var(--border)', borderRadius: '8px',
                            minWidth: '130px', background: 'var(--bg-surface)',
                          }}
                        >
                          {['admin', 'editor', 'viewer'].map(role => (
                            <Dropdown.Item
                              key={role}
                              onClick={() => handleRoleChange(member.user?._id || member.user, role)}
                              style={{
                                padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '5px',
                                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px',
                              }}
                            >
                              <RoleBadge role={role} />
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>

                      {isOwner && member.user?._id !== user?._id && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          title="Remove member"
                          style={{
                            width: '28px', height: '28px', borderRadius: '4px',
                            border: 'none', background: 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-tertiary)', cursor: 'pointer',
                            transition: 'background 150ms ease, color 150ms ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tab>
          
          {/* ── Pending Invites Tab ── */}
          <Tab eventKey="invitations" title="Pending invites" className="pt-2">
            <div style={{ marginBottom: '16px' }}>
              {!showInviteForm ? (
                <button onClick={() => setShowInviteForm(true)} className="btn-primary" style={{ gap: '6px' }}>
                  <UserPlus size={14} strokeWidth={2} />
                  Invite member
                </button>
              ) : (
                <form
                  onSubmit={handleSendInvitation}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '14px',
                    padding: '0 0 16px 0',
                    marginBottom: '16px',
                    borderBottom: '1px solid #E8E8E6',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field"
                      placeholder="teammate@company.com"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="input-field"
                      style={{ appearance: 'none' }}
                    >
                      <option value="viewer">Viewer (read-only)</option>
                      <option value="editor">Editor (can upload/edit)</option>
                      <option value="admin">Admin (full control)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => { setShowInviteForm(false); setInviteEmail(''); setInviteRole('viewer'); }}
                      className="btn-secondary"
                      disabled={sending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={sending || !inviteEmail.trim()}
                      style={{
                        height: '32px', padding: '0 14px',
                        background: !inviteEmail.trim() ? '#E8E8E6' : '#1A1A1A',
                        color: !inviteEmail.trim() ? '#9CA3AF' : '#FFFFFF',
                        border: 'none', borderRadius: '6px',
                        fontSize: '13px', fontWeight: 500,
                        cursor: (!inviteEmail.trim() || sending) ? 'not-allowed' : 'pointer',
                        transition: 'background 150ms ease, color 150ms ease',
                      }}
                    >
                      {sending ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          Sending...
                        </span>
                      ) : 'Send invitation'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#A0A0A0', marginBottom: '8px', marginTop: '16px' }}>
                Pending invites
              </p>
              {invitations.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center', padding: '32px 0',
                    border: '1px dashed var(--border)', borderRadius: '10px',
                  }}
                >
                  <Mail size={20} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No active invitations</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '3px 0 0' }}>Invite team members to collaborate</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      height: '44px', padding: '0 8px', borderRadius: '6px',
                      transition: 'background 100ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-primary)' }}>{invitation.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {invitation.role} ·{' '}
                        <span style={{
                          color: invitation.status === 'pending' ? '#F59E0B' : invitation.status === 'accepted' ? '#22C55E' : 'var(--text-tertiary)'
                        }}>
                          {invitation.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeInvitation(invitation._id)}
                      title="Revoke invitation"
                      style={{
                        width: '28px', height: '28px', borderRadius: '4px',
                        border: 'none', background: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-tertiary)', cursor: 'pointer',
                        transition: 'background 150ms ease, color 150ms ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Tab>

          {/* ── Settings Tab (owner only, non-personal) ── */}
          {isOwner && !isPersonal && (
            <Tab eventKey="settings" title="Settings" className="pt-2">
              <div
                style={{
                  border: '1px solid #FECACA',
                  background: '#FFF5F5',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', margin: '0 0 6px' }}>
                  Danger zone
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Deleting this organization will permanently remove all associated files, folders, and member access. This action{' '}
                  <strong style={{ color: '#DC2626' }}>cannot be recovered</strong>.
                </p>
                <div style={{ paddingTop: '12px', borderTop: '1px solid #FECACA' }}>
                  <button
                    onClick={handleDeleteOrganization}
                    disabled={deletingOrg}
                    style={{
                      height: '32px', padding: '0 14px',
                      background: '#DC2626', color: 'white',
                      border: 'none', borderRadius: '6px',
                      fontSize: '12px', fontWeight: 500,
                      cursor: deletingOrg ? 'not-allowed' : 'pointer',
                      opacity: deletingOrg ? 0.5 : 1,
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    {deletingOrg ? 'Processing...' : 'Delete organization'}
                  </button>
                </div>
              </div>
            </Tab>
          )}
        </Tabs>

        {/* ── Remove Member Confirm Modal ── */}
        <Modal
          show={showRemoveMemberConfirm}
          onHide={() => setShowRemoveMemberConfirm(false)}
          centered
          className="confirmation-modal"
          backdropClassName="confirmation-backdrop"
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#FEF2F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <AlertTriangle size={22} style={{ color: '#EF4444' }} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Remove member?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Are you sure you want to remove{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{memberToRemove?.user?.name || 'this member'}</strong>?{' '}
              They will lose access immediately.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowRemoveMemberConfirm(false)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                style={{
                  flex: 1, height: '32px', padding: '0 14px',
                  background: '#EF4444', color: 'white',
                  border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Remove
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Delete Org Confirm Modal ── */}
        <Modal
          show={showDeleteConfirm}
          onHide={() => { setShowDeleteConfirm(false); setConfirmOrgName(''); }}
          centered
          className="confirmation-modal"
          backdropClassName="confirmation-backdrop"
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#FEF2F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <AlertTriangle size={22} style={{ color: '#EF4444' }} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Delete organization?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This is <strong style={{ color: '#EF4444' }}>permanent</strong> and cannot be undone. All data, files, and member permissions will be deleted.
            </p>

            <div
              style={{
                textAlign: 'left', marginBottom: '20px',
                background: 'var(--bg-base)', padding: '14px',
                borderRadius: '8px', border: '1px solid var(--border)',
              }}
            >
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Type <strong style={{ color: 'var(--text-primary)' }}>{currentOrganization?.name}</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmOrgName}
                onChange={(e) => setConfirmOrgName(e.target.value)}
                placeholder={currentOrganization?.name}
                className="input-field"
                style={{
                  /* Only show red border when text is typed AND wrong */
                  borderColor: confirmOrgName && confirmOrgName !== currentOrganization?.name
                    ? '#EF4444'
                    : undefined,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setConfirmOrgName(''); }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteOrganization}
                disabled={confirmOrgName !== currentOrganization?.name || deletingOrg}
                style={{
                  flex: 1, height: '32px', padding: '0 14px',
                  background: '#EF4444', color: 'white',
                  border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 500,
                  cursor: (confirmOrgName !== currentOrganization?.name || deletingOrg) ? 'not-allowed' : 'pointer',
                  opacity: (confirmOrgName !== currentOrganization?.name || deletingOrg) ? 0.35 : 1,
                  transition: 'opacity 150ms ease',
                }}
              >
                {deletingOrg ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
};

export default ManageOrgModal;
