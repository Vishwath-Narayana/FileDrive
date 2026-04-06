import { useState } from 'react';
import { ChevronDown, LogOut, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Topbar = ({ onOpenAdminModal, onOpenCreateOrgModal, socket }) => {
  const { user, logout, organizations, currentOrganization, switchOrganization } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-20 glass-effect px-8 flex items-center justify-between sticky top-0 z-[40] ml-64">
      <div className="flex items-center gap-4">
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            className="flex items-center gap-2.5 border border-[#F0F0F0] bg-white text-black hover:bg-[#FAFAFA] font-bold px-5 py-2 rounded-full transition-all duration-200 text-sm shadow-sm hover:shadow-md"
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
                active={false}
                className={`py-2 px-4 text-sm flex items-center transition-all duration-200 mx-1 rounded-[8px] ${
                  currentOrganization?._id === org._id 
                    ? 'bg-black text-white font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {org.name}
              </Dropdown.Item>
            ))}
            <Dropdown.Divider className="my-2 border-[#EDEDED]" />
            <Dropdown.Item 
              onClick={onOpenCreateOrgModal}
              className="py-2.5 px-4 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-all duration-200 mx-1 rounded-[8px]"
            >
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center mr-3 text-gray-500">
                <Plus size={14} />
              </div>
              Create New
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
            className="text-sm font-medium text-gray-500 hover:text-black transition-all duration-200 hover:scale-105"
          >
            Manage
          </button>
        )}
        
        {/* Notification Bell */}
        <NotificationBell socket={socket} />
        
        {/* User Avatar + Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id="user-dropdown"
          >
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-[#EDEDED] p-[2px] overflow-hidden transition-all duration-200 group-hover:border-black group-hover:scale-110">
                <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
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
              className="py-2.5 px-4 text-sm text-gray-600 hover:bg-gray-50 hover:text-black flex items-center transition-all duration-200 mx-1 rounded-[8px]"
            >
              <User size={16} className="mr-3 text-gray-400" />
              Account Settings
            </Dropdown.Item>
            
            <Dropdown.Divider className="my-2 border-[#EDEDED]" />
            
            <Dropdown.Item 
              onClick={handleLogout} 
              className="py-2.5 px-4 text-sm text-red-500 hover:bg-red-50 flex items-center transition-all duration-200 mx-1 rounded-[8px] font-medium"
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
