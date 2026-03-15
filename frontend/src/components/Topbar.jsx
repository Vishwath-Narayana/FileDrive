import { useState, useEffect } from 'react';
import { ChevronDown, LogOut, Plus, User, Lock, Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onOpenAdminModal, onOpenCreateOrgModal }) => {
  const { user, logout, organizations, currentOrganization, switchOrganization, refreshOrganizations } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  
  useEffect(() => {
    fetchMyInvitations();
  }, []);

  const fetchMyInvitations = async () => {
    try {
      const response = await api.get('/organizations/invitations/me');
      setInvitations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch invitations', error);
    }
  };

  const handleAcceptInvite = async (invitationId) => {
    try {
      await api.post(`/organizations/invitations/${invitationId}/accept`);
      toast.success('Invitation accepted!');
      setInvitations(invitations.filter((inv) => inv._id !== invitationId));
      await refreshOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept invite');
    }
  };

  const handleRejectInvite = async (invitationId) => {
    try {
      await api.post(`/organizations/invitations/${invitationId}/reject`);
      toast.success('Invitation rejected!');
      setInvitations(invitations.filter((inv) => inv._id !== invitationId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject invite');
    }
  };

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            className="d-flex align-items-center gap-2 border-0 bg-transparent text-gray-900 hover:bg-gray-100 font-medium px-3 py-2 rounded-md transition-colors"
            id="org-dropdown"
          >
            <span className="truncate max-w-[150px]">{currentOrganization?.name || 'Select Organization'}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-sm border border-gray-200 py-1 rounded-lg min-w-[220px] mt-1">
            {organizations.map((org) => (
              <Dropdown.Item
                key={org._id}
                onClick={() => switchOrganization(org)}
                active={currentOrganization?._id === org._id}
                className={`py-2 px-3 text-sm flex items-center transition-colors ${
                  currentOrganization?._id === org._id 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {org.name}
              </Dropdown.Item>
            ))}
            <Dropdown.Divider className="my-1 border-gray-100" />
            <Dropdown.Item 
              onClick={onOpenCreateOrgModal}
              className="py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 flex items-center transition-colors"
            >
              <Plus size={16} className="mr-3 text-gray-500" />
              Create Organization
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="flex items-center gap-4">
        {currentOrganization && 
         currentOrganization._id !== user?.personalOrganization?._id &&
         currentOrganization._id !== user?.personalOrganization &&
         currentOrganization.members?.find(
          m => m.user._id === user?._id || m.user === user?._id
        )?.role === 'admin' && (
          <button
            onClick={onOpenAdminModal}
            className="px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 font-medium rounded-lg border border-gray-200 transition-colors"
          >
            Manage Organization
          </button>
        )}
        
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="p-2 border-0 bg-transparent text-gray-500 hover:bg-gray-100 rounded-md transition-colors relative flex items-center justify-center"
            id="notifications-dropdown"
          >
            <Bell size={20} />
            {invitations.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg border border-gray-200 py-2 rounded-lg min-w-[320px] mt-2 max-h-[400px] overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
              {invitations.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{invitations.length} new</span>
              )}
            </div>
            
            {invitations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                You have no new notifications.
              </div>
            ) : (
              invitations.map((inv) => (
                <div key={inv._id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <p className="text-sm text-gray-800 mb-2">
                    <span className="font-semibold">{inv.invitedBy?.name || 'Someone'}</span> invited you to join <span className="font-medium text-gray-900">"{inv.organization?.name || 'an organization'}"</span> as a <span className="capitalize">{inv.role}</span>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAcceptInvite(inv._id); }}
                      className="flex-1 flex items-center justify-center gap-1 bg-black text-white text-xs font-medium py-1.5 rounded hover:bg-gray-800"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRejectInvite(inv._id); }}
                      className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs font-medium py-1.5 rounded hover:bg-gray-50"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </Dropdown.Menu>
        </Dropdown>
        
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id="user-dropdown"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-sm border border-gray-200 py-1 rounded-lg min-w-[200px] mt-2">
            <Dropdown.Item disabled className="pb-3 pt-2 opacity-100 bg-transparent">
              <div className="font-medium text-sm text-gray-900 truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </Dropdown.Item>
            <Dropdown.Divider className="my-1 border-gray-100" />
            <Dropdown.Item 
              onClick={() => navigate('/settings', { state: { tab: 'profile' } })} 
              className="py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 flex items-center transition-colors"
            >
              <User size={16} className="mr-3 text-gray-500" />
              Account Details
            </Dropdown.Item>
            <Dropdown.Item 
              onClick={() => navigate('/settings', { state: { tab: 'security' } })} 
              className="py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 flex items-center transition-colors"
            >
              <Lock size={16} className="mr-3 text-gray-500" />
              Security
            </Dropdown.Item>
            <Dropdown.Divider className="my-1 border-gray-100" />
            <Dropdown.Item 
              onClick={logout} 
              className="py-2.5 px-3 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 flex items-center transition-colors"
            >
              <LogOut size={16} className="mr-3" />
              Sign out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Topbar;
