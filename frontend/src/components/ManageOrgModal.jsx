import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { Mail, UserPlus, X, ChevronDown, Trash2, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import socket from '../services/socket';
import Avatar from './Avatar';
import RoleBadge from './RoleBadge';

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
  const [removingMember, setRemovingMember] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmOrgName, setConfirmOrgName] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    if (show && currentOrganization) {
      fetchOrganizationData();
      setInviteSuccess(null);
      setActiveTab('members');
      setShowInviteForm(false);
    }
  }, [show, currentOrganization]);

  // Join the socket room for real-time org updates
  useEffect(() => {
    if (!currentOrganization) return;

    const orgId = currentOrganization._id;
    socket.emit('join-org', orgId);
    console.log('🔌 Joined org room:', orgId);

    const handleOrgUpdated = (updatedOrg) => {
      console.log('org:updated received:', updatedOrg._id, orgId);
      if (updatedOrg._id.toString() === orgId.toString()) {
        setMembers(updatedOrg.members || []);
      }
    };

    socket.on('org:updated', handleOrgUpdated);

    return () => {
      socket.off('org:updated', handleOrgUpdated);
      socket.emit('leave-org', orgId);
      console.log('🔌 Left org room:', orgId);
    };
  }, [currentOrganization?._id]);

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

    // Safely extract the user ID whether member.user is a populated object or a raw string
    const userId =
      memberToRemove.user?._id?.toString() ||
      memberToRemove.user?.toString();

    if (!userId) {
      toast.error('Unable to identify member — please refresh and try again.');
      return;
    }

    try {
      setRemovingMember(true);
      console.log('🗑️ Removing member userId:', userId, 'from org:', currentOrganization._id);
      const res = await api.delete(`/organizations/${currentOrganization._id}/members/${userId}`);
      console.log('✅ Remove member response:', res.data);
      toast.success('Member removed successfully');
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);
      await fetchOrganizationData();
      await refreshOrganizations();
    } catch (error) {
      console.error('❌ Remove member error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemovingMember(false);
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

      const inviteToken = response.data.token;
      const inviteLink = `https://file-drive-amber.vercel.app/accept-invite?token=${inviteToken}`;

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

    const deletedOrgId = currentOrganization._id;
    const personalOrgId = user?.personalOrganization?.toString();

    try {
      setDeletingOrg(true);
      console.log('🗑️ Deleting org:', deletedOrgId);
      await api.delete(`/organizations/${deletedOrgId}`);
      console.log('✅ Org deleted');
      toast.success('Organization deleted successfully');

      localStorage.removeItem('currentOrganization');

      // refreshOrganizations updates state AND returns fresh list via the API;
      // we fetch fresh org list directly so the closure isn't stale
      const { data: freshOrgs } = await api.get('/organizations');
      const remainingOrgs = freshOrgs.filter(o => o._id !== deletedOrgId);
      const fallback =
        remainingOrgs.find(o => o._id === personalOrgId) ||
        remainingOrgs[0] ||
        null;

      // Sync context with fresh data
      await refreshOrganizations();
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

  const ownerId =
    currentOrganization?.owner?._id?.toString() ||
    currentOrganization?.owner?.toString();
  const isOwner = ownerId === user?._id?.toString();
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

  if (!show) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1030
        }}
        onClick={onHide}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            width: '520px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* MODAL HEADER (does NOT scroll) */}
          <div style={{
            padding: '24px 24px 0 24px', flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Manage organization
              </h2>
              <p className="cc-text-mono" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-quaternary)', margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {currentOrganization?.name}
              </p>
            </div>
            <button
              onClick={onHide}
              style={{
                width: '32px', height: '32px', borderRadius: '6px',
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 150ms ease',
                marginRight: '-8px', marginTop: '-4px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={16} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>

        {/* Invite success banner */}
        {inviteSuccess && (
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 14px', margin: '16px 24px 0',
              background: 'var(--accent-green-soft)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px',
            }}
          >
            <Mail size={15} style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-green)', margin: 0 }}>Invitation sent!</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                A magic link was emailed to <strong>{inviteSuccess.email}</strong>. They'll join automatically after clicking it.
              </p>
            </div>
            <button onClick={() => setInviteSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-green)', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* TAB BAR (does NOT scroll) */}
        <div style={{
          display: 'flex', gap: '24px', padding: '0 24px', marginTop: '16px',
          borderBottom: '1px solid var(--border)', flexShrink: 0
        }}>
          {['Members', 'Pending invites', ...(isOwner && !isPersonal ? ['Settings'] : [])].map(tab => {
            const key = tab.toLowerCase().split(' ')[0];
            const tabKey = key === 'pending' ? 'invitations' : key;
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                style={{
                  padding: '10px 0', marginBottom: '-1px',
                  fontSize: '13px', color: isActive ? 'var(--accent-indigo)' : 'var(--text-tertiary)',
                  fontWeight: isActive ? 600 : 400, background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 150ms'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* MODAL BODY (scrollable) */}
        <style>{`
          .manage-org-body::-webkit-scrollbar { width: 6px; }
          .manage-org-body::-webkit-scrollbar-track { background: transparent; }
          .manage-org-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        `}</style>
        <div className="manage-org-body" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px 24px 120px 24px', // Added extra bottom padding so dropdowns don't get clipped
          minHeight: 0, 
          scrollbarWidth: 'thin', 
          scrollbarColor: 'var(--border) transparent' 
        }}>
          {/* Invite success banner */}
          {activeTab === 'members' && (
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
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-tertiary)' }}>No members found</p>
              ) : (
                members.filter(m => m.user).map((member, idx, arr) => (
                  <div
                    key={member.user?._id || member.user}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 10px', margin: '0 -10px', borderRadius: '10px',
                      borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Avatar */}
                    <Avatar
                      initials={member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      size={36}
                      fontSize={14}
                      fontWeight={600}
                      background="var(--bg-card)"
                      color="var(--text-tertiary)"
                    />

                    {/* Info block */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {member.user?.name || 'Unknown User'}
                      </div>
                      <div className="cc-text-mono" style={{
                        fontSize: '11.5px', color: 'var(--text-tertiary)', margin: '3px 0 0',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {member.user?.email || ''}
                      </div>
                    </div>

                    {/* Right side (role badge + chevron) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="link"
                          size="sm"
                          className="text-decoration-none p-0 border-0 bg-transparent"
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', transition: 'background 120ms ease' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <RoleBadge role={member.role} />
                            <ChevronDown size={11} style={{ color: 'var(--text-tertiary)' }} />
                          </div>
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                          className="shadow-lg py-1"
                          style={{
                            border: '1px solid var(--border)', borderRadius: '12px',
                            minWidth: '130px', background: 'var(--bg-surface)',
                            boxShadow: '0 12px 32px rgba(15,17,21,0.10), 0 2px 8px rgba(15,17,21,0.04)',
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
          )}
          
          {/* ── Pending Invites Tab ── */}
          {activeTab === 'invitations' && (
            <>
              <div>
                {!showInviteForm ? (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    style={{
                      height: '32px', padding: '0 14px',
                      background: 'var(--accent-indigo)', color: '#FFFFFF',
                      border: 'none', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginBottom: '16px', boxShadow: 'var(--accent-indigo-glow)',
                      transition: 'background 150ms ease, box-shadow 150ms ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-indigo-hover)'; e.currentTarget.style.boxShadow = 'var(--accent-indigo-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-indigo)'; e.currentTarget.style.boxShadow = 'var(--accent-indigo-glow)'; }}
                  >
                    <UserPlus size={14} strokeWidth={2} />
                    Invite member
                  </button>
                ) : (
                  <form
                    onSubmit={handleSendInvitation}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '14px',
                      padding: '16px',
                      marginBottom: '16px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
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
                          background: !inviteEmail.trim() ? '#E8E8E6' : '#5B5BD6',
                          color: !inviteEmail.trim() ? '#9CA3AF' : '#FFFFFF',
                          border: 'none', borderRadius: '8px',
                          fontSize: '13px', fontWeight: 500,
                          cursor: (!inviteEmail.trim() || sending) ? 'not-allowed' : 'pointer',
                          boxShadow: !inviteEmail.trim() ? 'none' : '0 1px 2px rgba(91,91,214,0.25)',
                          transition: 'background 150ms ease, color 150ms ease, box-shadow 150ms ease',
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
                <p className="cc-text-mono" style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)',
                  marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Pending invites
                </p>
                {invitations.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '36px 20px',
                    border: '1px dashed var(--border)', borderRadius: '12px',
                    background: 'var(--bg-base)',
                  }}>
                    <Mail size={20} style={{ color: '#A3A3A3', margin: '0 auto' }} />
                    <p style={{ fontSize: '13px', color: '#737373', margin: '8px 0 4px' }}>No active invitations</p>
                    <p style={{ fontSize: '12px', color: '#A3A3A3', margin: 0 }}>Invite team members to collaborate</p>
                  </div>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation._id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        height: '48px', padding: '0 10px', margin: '0 -10px', borderRadius: '10px',
                        transition: 'background 100ms ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{invitation.email}</div>
                        <div className="cc-text-mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
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
            </>
          )}

          {/* ── Settings Tab (owner only, non-personal) ── */}
          {activeTab === 'settings' && isOwner && !isPersonal && (
            <div>
              <div
                style={{
                  border: '1px solid rgba(239,68,68,0.3)',
                  background: 'var(--accent-red-soft)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <p className="cc-text-mono" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-red)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                  Danger zone
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  Deleting this organization will permanently remove all associated files, folders, and member access. This action{' '}
                  <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>cannot be recovered</span>.
                </p>
                <div style={{ margin: '0 0 16px', borderTop: '1px solid rgba(239,68,68,0.3)' }} />
                <div>
                  <button
                    onClick={handleDeleteOrganization}
                    disabled={deletingOrg}
                    style={{
                      height: '32px', padding: '0 14px',
                      background: 'var(--accent-red)', color: '#FFFFFF',
                      border: 'none', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 500,
                      cursor: deletingOrg ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center',
                      opacity: deletingOrg ? 0.5 : 1,
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => { if (!deletingOrg) e.currentTarget.style.background = '#DC2626'; }}
                    onMouseLeave={e => { if (!deletingOrg) e.currentTarget.style.background = 'var(--accent-red)'; }}
                  >
                    {deletingOrg ? 'Processing...' : 'Delete organization'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* ── Remove Member Confirm Modal ── */}
        <Modal
          show={showRemoveMemberConfirm}
          onHide={() => setShowRemoveMemberConfirm(false)}
          centered
          className="confirmation-modal"
          backdropClassName="confirmation-backdrop"
          style={{ zIndex: 1070 }}
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
                disabled={removingMember}
                style={{
                  flex: 1, height: '32px', padding: '0 14px',
                  background: '#EF4444', color: 'white',
                  border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 500,
                  cursor: removingMember ? 'not-allowed' : 'pointer',
                  opacity: removingMember ? 0.6 : 1,
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => { if (!removingMember) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { if (!removingMember) e.currentTarget.style.opacity = '1'; }}
              >
                {removingMember ? 'Removing...' : 'Remove'}
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
          style={{ zIndex: 1070 }}
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default ManageOrgModal;
