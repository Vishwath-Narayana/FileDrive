import { ChevronDown, LogOut } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onOpenAdminModal }) => {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center gap-2 hover:bg-gray-50">
          <span>My Organization</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'admin' && (
          <button
            onClick={onOpenAdminModal}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            Members
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
