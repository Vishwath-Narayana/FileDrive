import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { Mail, UserPlus } from 'lucide-react';
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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Organization - {currentOrganization?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="members" className="mb-3">
          <Tab eventKey="members" title="Members">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No members found</div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.user._id || member.user}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                        {member.user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                        <div className="text-xs text-gray-500">{member.user.email}</div>
                      </div>
                    </div>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="outline-secondary" size="sm" id={`role-dropdown-${member.user._id || member.user}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleRoleChange(member.user._id || member.user, 'admin')}>
                          Admin
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRoleChange(member.user._id || member.user, 'editor')}>
                          Editor
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRoleChange(member.user._id || member.user, 'viewer')}>
                          Viewer
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                ))
              )}
            </div>
          </Tab>
          
          <Tab eventKey="invitations" title="Invitations">
            <div className="mb-3">
              {!showInviteForm ? (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Send Invitation
                </button>
              ) : (
                <form onSubmit={handleSendInvitation} className="space-y-3 p-3 border border-gray-200 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field"
                      placeholder="user@example.com"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="input-field"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
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

            <div className="space-y-2 mt-4">
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending invitations
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invitation.email}</div>
                        <div className="text-xs text-gray-500">
                          Role: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)} • 
                          Status: {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invitation.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default ManageOrgModal;
