import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { Mail, UserPlus, X, ChevronDown, Trash2, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const ManageOrgModal = ({ show, onHide }) => {
  const { user, currentOrganization, refreshOrganizations } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deletingOrg, setDeletingOrg] = useState(false);
  const [inviteRole, setInviteRole] = useState('viewer');
  const [sending, setSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null); // {email}
  
  // Custom confirmation modal states
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
      // 1. Create invitation in MongoDB → get token
      const response = await api.post(`/organizations/${currentOrganization._id}/invitations`, {
        email: inviteEmail,
        role: inviteRole
      });

      const token = response.data.token;
      const inviteLink = `${window.location.origin}/accept-invite?token=${token}`;

      // 2. Send Supabase Magic Link with invite token embedded in redirect URL
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          emailRedirectTo: inviteLink,
          shouldCreateUser: true  // handles both new + existing users
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
      setShowDeleteConfirm(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    } finally {
      setDeletingOrg(false);
    }
  };

  const isOwner = currentOrganization?.owner === user?._id || currentOrganization?.owner?._id === user?._id;
  const isPersonal = user?.personalOrganization === currentOrganization?._id;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="premium-modal">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-black mb-1 tracking-tight">Manage Organization</h2>
            <p className="text-sm font-medium text-gray-400">Workspace Settings & Members</p>
          </div>
          <button 
            onClick={onHide} 
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-black hover:border-black transition-all duration-300 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Email Sent Success Banner — no raw link */}
        {inviteSuccess && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[20px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-900 mb-0.5">Invitation sent!</p>
                <p className="text-xs text-green-700">A magic link was emailed to <span className="font-bold">{inviteSuccess.email}</span>. They'll join automatically after clicking it.</p>
              </div>
              <button onClick={() => setInviteSuccess(null)} className="p-1 text-green-400 hover:text-green-700">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <Tabs defaultActiveKey="members" className="premium-tabs mb-8 border-b border-[#EDEDED]">
          <Tab eventKey="members" title="Members" className="pt-2">
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-[#EDEDED] rounded-[16px] animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100" />
                        <div>
                          <div className="h-3.5 bg-gray-100 rounded w-24 mb-2" />
                          <div className="h-2.5 bg-gray-50 rounded w-32" />
                        </div>
                      </div>
                      <div className="h-8 bg-gray-50 rounded-full w-20" />
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No members found</div>
              ) : (
                members.filter(m => m.user).map((member) => (
                  <div
                    key={member.user?._id || member.user}
                    className="flex items-center justify-between p-4 bg-white border border-[#EDEDED] rounded-[16px] hover:border-black hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold ring-2 ring-gray-50">
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">{member.user?.name || 'Unknown User'}</div>
                        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">{member.user?.email || ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" size="sm" className="flex items-center gap-2 bg-gray-50 border-0 text-[11px] font-bold text-gray-600 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all duration-200">
                          {member.role.toUpperCase()}
                          <ChevronDown size={12} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow-2xl border border-[#EDEDED] py-2 rounded-[12px] min-w-[140px] mt-1">
                          <Dropdown.Item onClick={() => handleRoleChange(member.user?._id || member.user, 'admin')} className="py-2 px-4 text-xs font-bold hover:bg-gray-50 rounded-[8px] mx-1">ADMIN</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleRoleChange(member.user?._id || member.user, 'editor')} className="py-2 px-4 text-xs font-bold hover:bg-gray-50 rounded-[8px] mx-1">EDITOR</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleRoleChange(member.user?._id || member.user, 'viewer')} className="py-2 px-4 text-xs font-bold hover:bg-gray-50 rounded-[8px] mx-1">VIEWER</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>

                      {isOwner && member.user?._id !== user?._id && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 group/delete border border-transparent hover:border-red-100"
                          title="Remove member"
                        >
                          <Trash2 size={16} className="group-hover/delete:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tab>
          
          <Tab eventKey="invitations" title="Pending Invites" className="pt-2">
            <div className="mb-6">
              {!showInviteForm ? (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="btn-primary hover:scale-[1.02] active:scale-95"
                >
                  <UserPlus size={16} strokeWidth={2.5} />
                  Invite Member
                </button>
              ) : (
                <form onSubmit={handleSendInvitation} className="space-y-5 p-6 bg-gray-50/50 border border-[#EDEDED] rounded-[20px] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field bg-white"
                      placeholder="teammate@company.com"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Permissions Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="input-field bg-white appearance-none"
                    >
                      <option value="viewer">Viewer (Read-only)</option>
                      <option value="editor">Editor (Can upload/edit)</option>
                      <option value="admin">Admin (Full Control)</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail('');
                        setInviteRole('viewer');
                      }}
                      className="btn-secondary"
                      disabled={sending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={sending || !inviteEmail.trim()}
                    >
                      {sending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-3 mt-8">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Pending Access Requests</h4>
              {invitations.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-[#EDEDED] rounded-[20px]">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">No active invitations</p>
                  <p className="text-xs text-gray-300 mt-1">Invite team members to collaborate</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="flex items-center justify-between p-4 bg-white border border-[#EDEDED] rounded-[16px] hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <Mail size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">{invitation.email}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          {invitation.role} • <span className={invitation.status === 'pending' ? 'text-amber-500' : invitation.status === 'accepted' ? 'text-green-500' : 'text-gray-400'}>{invitation.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wide">Pending</span>
                      )}
                      <button
                        onClick={() => handleRevokeInvitation(invitation._id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                        title="Revoke invitation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tab>

          {isOwner && !isPersonal && (
            <Tab eventKey="settings" title="Settings" className="pt-2">
              <div className="relative overflow-hidden p-8 bg-gradient-to-br from-red-50 via-white to-[#FFF5F5] border border-red-100 rounded-[28px] shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                
                <div className="relative flex items-start gap-5">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600 shadow-inner">
                    <AlertTriangle size={24} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-red-600 mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-[480px] mb-8">
                      Deleting this organization will permanently remove all associated files, folders, and member access. This action <span className="font-bold text-red-600 underline underline-offset-4">cannot be recovered</span>.
                    </p>
                    <div className="flex justify-end pt-4 border-t border-red-100/50">
                      <button
                        onClick={handleDeleteOrganization}
                        disabled={deletingOrg}
                        className="bg-red-600 text-white text-xs font-bold py-3 px-8 rounded-full hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {deletingOrg ? 'Processing...' : 'Delete Organization'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>
          )}
        </Tabs>

        {/* Custom Confirmation Modals */}
        <Modal 
          show={showRemoveMemberConfirm} 
          onHide={() => setShowRemoveMemberConfirm(false)}
          centered
          className="confirmation-modal"
          backdropClassName="confirmation-backdrop"
        >
          <div className="p-8 text-center bg-white rounded-[28px] overflow-hidden">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Remove Member?</h3>
            <p className="text-sm text-gray-500 mb-8 px-4 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-black">{memberToRemove?.user?.name || 'this member'}</span>? They will lose access to all files and shared resources immediately.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRemoveMemberConfirm(false)}
                className="flex-1 btn-secondary text-sm font-bold py-3"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveMember}
                className="flex-1 bg-red-600 text-white text-sm font-bold py-3 rounded-full hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
              >
                Remove Access
              </button>
            </div>
          </div>
        </Modal>

        <Modal 
          show={showDeleteConfirm} 
          onHide={() => {
            setShowDeleteConfirm(false);
            setConfirmOrgName('');
          }}
          centered
          className="confirmation-modal"
          backdropClassName="confirmation-backdrop"
        >
          <div className="p-10 text-center bg-white rounded-[32px] overflow-hidden border border-red-50 shadow-2xl">
            <div className="w-20 h-20 bg-red-100/50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600 shadow-inner group">
              <AlertTriangle size={40} className="group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-bold text-black mb-3 tracking-tight">Delete Organization?</h3>
            <p className="text-sm text-gray-500 mb-8 px-6 leading-relaxed">
              This action is <span className="font-bold text-red-600">permanent</span> and cannot be undone. All data, files, and member permissions will be <span className="font-bold text-black uppercase tracking-wider text-xs">permanently deleted</span>.
            </p>

            <div className="mb-8 text-left bg-red-50/50 p-6 rounded-[20px] border border-red-100">
              <label className="block text-[11px] font-bold text-red-600/70 uppercase tracking-widest mb-3">
                Type organization name to confirm
              </label>
              <input
                type="text"
                value={confirmOrgName}
                onChange={(e) => setConfirmOrgName(e.target.value)}
                placeholder={currentOrganization?.name}
                className="w-full bg-white border-2 border-red-100 rounded-xl px-4 py-3.5 text-sm font-bold text-black placeholder:text-red-200 outline-none focus:border-red-300 transition-all"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmOrgName('');
                }}
                className="flex-1 btn-secondary text-base font-bold py-4 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteOrganization}
                disabled={confirmOrgName !== currentOrganization?.name || deletingOrg}
                className="flex-[1.5] bg-red-600 text-white text-base font-bold py-4 rounded-full hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-red-200 transition-all active:scale-95 shadow-lg shadow-red-100"
              >
                {deletingOrg ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

export default ManageOrgModal;
