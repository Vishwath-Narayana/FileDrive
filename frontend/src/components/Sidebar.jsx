import { File, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  
  const menuItems = [
    { id: 'all', label: 'All Files', icon: File },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div
      className="glass-effect flex flex-col h-screen fixed left-0 top-0 z-50"
      style={{ width: '200px' }}
    >
      {/* Logo area */}
      <div
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        style={{
          height: '52px',
          padding: '0 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <img
          src={logo}
          alt="FileDrive Logo"
          style={{ width: '16px', height: '16px', objectFit: 'cover', borderRadius: '4px' }}
        />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          FileDrive
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2" style={{ padding: '8px 0' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom — org name */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22C55E',
              flexShrink: 0,
            }}
          />
          <span
            className="truncate"
            style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}
          >
            {currentOrganization?.name || 'Personal'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
