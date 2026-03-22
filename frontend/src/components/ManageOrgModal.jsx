import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { Mail, UserPlus, X, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManageOrgModal = ({ show, onHide }) => {
  const { currentOrganization, refreshOrganizations } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (show && currentOrganization) {
      fetchOrganizationData();
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
      await api.post(`/organizations/${currentOrganization._id}/invitations`, {
        email: inviteEmail,
        role: inviteRole
      });
      toast.success('Invitation sent successfully');
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

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="premium-modal">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-black mb-1">Manage Organization</h2>
            <p className="text-sm text-gray-400">{currentOrganization?.name}</p>
          </div>
          <button onClick={onHide} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        <Tabs defaultActiveKey="members" className="premium-tabs mb-8 border-b border-[#EDEDED]">
          <Tab eventKey="members" title="Members" className="pt-2">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-gray-400 text-sm">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No members found</div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.user._id || member.user}
                    className="flex items-center justify-between p-4 bg-white border border-[#EDEDED] rounded-[16px] hover:border-black transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold ring-2 ring-gray-50">
                        {member.user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">{member.user.name}</div>
                        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">{member.user.email}</div>
                      </div>
                    </div>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="light" size="sm" className="flex items-center gap-2 bg-gray-50 border-0 text-[11px] font-bold text-gray-600 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all">
                        {member.role.toUpperCase()}
                        <ChevronDown size={12} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="shadow-2xl border border-[#EDEDED] py-2 rounded-[12px] min-w-[140px] mt-1">
                        <Dropdown.Item onClick={() => handleRoleChange(member.user._id || member.user, 'admin')} className="py-2 px-4 text-xs font-bold hover:bg-gray-50 rounded-[8px] mx-1">ADMIN</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRoleChange(member.user._id || member.user, 'editor')} className="py-2 px-4 text-xs font-bold hover:bg-gray-50 rounded-[8px] mx-1">EDITOR</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRoleChange(member.user._id || member.user, 'viewer')} className="py-2 px-4 text-xs font-bold hover:bg-gray-50 rounded-[8px] mx-1">VIEWER</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
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
                  className="btn-primary"
                >
                  <UserPlus size={16} strokeWidth={2.5} />
                  Invite Member
                </button>
              ) : (
                <form onSubmit={handleSendInvitation} className="space-y-5 p-6 bg-gray-50/50 border border-[#EDEDED] rounded-[20px] animate-in fade-in duration-300">
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
                      {sending ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-3 mt-8">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Pending Access Requests</h4>
              {invitations.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-[#EDEDED] rounded-[20px] text-gray-300 text-sm">
                  No active invitations
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="flex items-center justify-between p-4 bg-white border border-[#EDEDED] rounded-[16px]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <Mail size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">{invitation.email}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          {invitation.role} • {invitation.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {invitation.status === 'pending' && (
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/accept-invite?token=${invitation.token}`;
                            navigator.clipboard.writeText(link);
                            toast.success('Link copied to clipboard');
                          }}
                          className="text-[10px] font-bold text-black bg-gray-50 hover:bg-black hover:text-white px-4 py-2 rounded-full transition-all uppercase tracking-tighter"
                        >
                          Copy Magic Link
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </Modal>
  );
};

export default ManageOrgModal;
