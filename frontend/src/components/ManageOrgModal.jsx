import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { Mail, UserPlus, X, ChevronDown, Trash2, Copy, Check, Link2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [inviteSuccess, setInviteSuccess] = useState(null); // {email, link}
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (show && currentOrganization) {
      fetchOrganizationData();
      setInviteSuccess(null);
      setCopied(false);
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

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the organization?')) return;
    
    try {
      await api.delete(`/organizations/${currentOrganization._id}/members/${userId}`);
      toast.success('Member removed successfully');
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

      // Build invite link and show success state
      const link = `${window.location.origin}/accept-invite?token=${response.data.token}`;
      setInviteSuccess({ email: inviteEmail, link });
      
      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (_) {}

      toast.success('Invitation created!');
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

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copied!', { icon: '📋' });
      setTimeout(() => setCopied(false), 3000);
    } catch (_) {
      toast.error('Failed to copy');
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

  const handleDeleteOrganization = async () => {
    if (!window.confirm('Are you sure you want to delete this organization? This action is permanent and cannot be undone.')) return;
    try {
      setDeletingOrg(true);
      await api.delete(`/organizations/${currentOrganization._id}`);
      toast.success('Organization deleted successfully');
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

        {/* Invite Success Banner */}
        {inviteSuccess && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[20px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={20} className="text-green-600" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-900 mb-1">Invitation sent to {inviteSuccess.email}</p>
                <div className="bg-white border border-green-200 rounded-xl p-3 mb-3">
                  <p className="text-[11px] text-gray-500 font-mono break-all leading-relaxed">{inviteSuccess.link}</p>
                </div>
                <button
                  onClick={() => handleCopyLink(inviteSuccess.link)}
                  className="flex items-center gap-2 text-xs font-bold text-green-700 hover:text-green-900 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied to clipboard!' : 'Copy invite link'}
                </button>
              </div>
              <button
                onClick={() => setInviteSuccess(null)}
                className="p-1 text-green-400 hover:text-green-700 transition-colors"
              >
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
                          onClick={() => handleRemoveMember(member.user?._id)}
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
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/accept-invite?token=${invitation.token}`;
                            handleCopyLink(link);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-black bg-gray-50 hover:bg-black hover:text-white px-4 py-2 rounded-full transition-all duration-200 uppercase tracking-tighter"
                        >
                          <Link2 size={12} />
                          Copy Link
                        </button>
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
      </div>
    </Modal>
  );
};

export default ManageOrgModal;
