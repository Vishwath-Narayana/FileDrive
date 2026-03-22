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
    <div className="h-20 glass-effect px-8 flex items-center justify-between sticky top-0 z-[40] ml-64">
      <div className="flex items-center gap-4">
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            className="flex items-center gap-2.5 border border-[#F0F0F0] bg-white text-black hover:bg-[#FAFAFA] font-bold px-5 py-2 rounded-full transition-all text-sm shadow-sm"
            id="org-dropdown"
          >
            <span className="max-w-[150px] truncate tracking-tight">{currentOrganization?.name || 'Select Organization'}</span>
            <ChevronDown size={14} className="text-gray-400" strokeWidth={2.5} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-xl border border-[#EDEDED] py-2 rounded-[12px] min-w-[240px] mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Organizations</div>
            {organizations.map((org) => (
              <Dropdown.Item
                key={org._id}
                onClick={() => switchOrganization(org)}
                active={currentOrganization?._id === org._id}
                className={`py-2 px-4 text-sm flex items-center transition-colors mx-1 rounded-[8px] ${
                  currentOrganization?._id === org._id 
                    ? 'bg-gray-100 text-black font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {org.name}
              </Dropdown.Item>
            ))}
            <Dropdown.Divider className="my-2 border-[#EDEDED]" />
            <Dropdown.Item 
              onClick={onOpenCreateOrgModal}
              className="py-2.5 px-4 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors mx-1 rounded-[8px]"
            >
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center mr-3 text-gray-500">
                <Plus size={14} />
              </div>
              Create New
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="flex items-center gap-6">
        {currentOrganization && 
         currentOrganization._id !== user?.personalOrganization?._id &&
         currentOrganization._id !== user?.personalOrganization &&
         currentOrganization.members?.find(
          m => m.user._id === user?._id || m.user === user?._id
        )?.role === 'admin' && (
          <button
            onClick={onOpenAdminModal}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Settings
          </button>
        )}
        
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="p-2 border-0 bg-transparent text-gray-400 hover:text-black rounded-full transition-all relative flex items-center justify-center hover:bg-gray-50"
            id="notifications-dropdown"
          >
            <Bell size={20} strokeWidth={2} />
            {invitations.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-2xl border border-[#EDEDED] py-0 rounded-[16px] min-w-[340px] mt-2 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-[#EDEDED] flex items-center justify-between">
              <span className="font-bold text-black text-sm">Notifications</span>
              {invitations.length > 0 && (
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">New</span>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {invitations.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">All caught up</p>
                </div>
              ) : (
                invitations.map((inv) => (
                  <div key={inv._id} className="px-5 py-4 border-b border-[#EDEDED] hover:bg-gray-50 transition-colors">
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      <span className="font-bold text-black">{inv.invitedBy?.name || 'Someone'}</span> invited you to join <span className="font-bold text-black">{inv.organization?.name}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAcceptInvite(inv._id); }}
                        className="flex-1 bg-black text-white text-[11px] font-bold py-2 rounded-[6px] hover:bg-gray-800 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRejectInvite(inv._id); }}
                        className="flex-1 bg-white border border-[#EDEDED] text-gray-600 text-[11px] font-bold py-2 rounded-[6px] hover:bg-gray-50 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
        
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id="user-dropdown"
          >
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-gray-100 border border-[#EDEDED] p-[2px] overflow-hidden transition-all group-hover:border-black">
                <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={`http://localhost:5001${user.avatar}`}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-2xl border border-[#EDEDED] py-2 rounded-[16px] min-w-[220px] mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-[#EDEDED] mb-1">
              <div className="font-bold text-sm text-black">{user?.name}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{user?.email}</div>
            </div>
            
            <Dropdown.Item 
              onClick={() => navigate('/settings')} 
              className="py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 hover:text-black flex items-center transition-colors mx-1 rounded-[8px]"
            >
              <User size={16} className="mr-3 text-gray-400" />
              Profile
            </Dropdown.Item>
            <Dropdown.Item 
              onClick={() => navigate('/settings', { state: { tab: 'security' } })} 
              className="py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 hover:text-black flex items-center transition-colors mx-1 rounded-[8px]"
            >
              <Lock size={16} className="mr-3 text-gray-400" />
              Security
            </Dropdown.Item>
            
            <Dropdown.Divider className="my-2 border-[#EDEDED]" />
            
            <Dropdown.Item 
              onClick={logout} 
              className="py-2.5 px-4 text-sm text-red-500 hover:bg-red-50 flex items-center transition-colors mx-1 rounded-[8px] font-medium"
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
