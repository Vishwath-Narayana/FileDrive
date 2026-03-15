import { ChevronDown, LogOut, Plus } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onOpenAdminModal, onOpenCreateOrgModal }) => {
  const { user, logout, organizations, currentOrganization, switchOrganization } = useAuth();

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-secondary"
            className="d-flex align-items-center gap-2"
            id="org-dropdown"
          >
            <span>{currentOrganization?.name || 'Select Organization'}</span>
            <ChevronDown size={16} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {organizations.map((org) => (
              <Dropdown.Item
                key={org._id}
                onClick={() => switchOrganization(org)}
                active={currentOrganization?._id === org._id}
              >
                {org.name}
              </Dropdown.Item>
            ))}
            <Dropdown.Divider />
            <Dropdown.Item onClick={onOpenCreateOrgModal}>
              <Plus size={16} className="me-2" />
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

          <Dropdown.Menu>
            <Dropdown.Item disabled>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout}>
              <LogOut size={16} className="me-2" />
              Sign out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Topbar;
