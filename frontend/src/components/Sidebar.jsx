import { File, Star, Trash2, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab, drawerOpen, setDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganization } = useAuth();
  
  const menuItems = [
    { id: 'all', label: 'All Files', icon: File },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const handleNavClick = (id) => {
    navigate('/dashboard', { state: { tab: id } });
    if (setDrawerOpen) setDrawerOpen(false);
  };

  const SidebarContents = ({ isDrawer = false }) => (
    <>
      {/* Logo area */}
      <div
        onClick={() => { navigate('/dashboard'); if (isDrawer && setDrawerOpen) setDrawerOpen(false); }}
        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        style={{
          height: '52px',
          padding: '0 16px',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
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

        {/* Close button (drawer only) */}
        {isDrawer && setDrawerOpen && (
          <button
            onClick={(e) => { e.stopPropagation(); setDrawerOpen(false); }}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              width: '32px', height: '32px', borderRadius: '6px',
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-tertiary)', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1" style={{ padding: '8px 0' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === '/dashboard' && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`sidebar-item nav-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom — org name */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: '8px', height: '8px',
              borderRadius: '50%', background: '#22C55E', flexShrink: 0,
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
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div
        className="glass-effect flex-col h-screen fixed left-0 top-0 z-50"
        style={{ width: '200px', display: 'none' }}
      >
        {/* Desktop uses media query via the style tag below */}
        <SidebarContents />
      </div>

      {/* Use CSS to show/hide based on screen size */}
      <style>{`
        .sidebar-desktop {
          display: flex !important;
          flex-direction: column;
        }
        @media (max-width: 767px) {
          .sidebar-desktop {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="glass-effect sidebar-desktop h-screen fixed left-0 top-0 z-50"
        style={{ width: '200px' }}
      >
        <SidebarContents />
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 40,
            }}
          />
          {/* Drawer panel */}
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: '240px',
              background: '#FFFFFF',
              zIndex: 50,
              borderRight: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              transform: 'translateX(0)',
              transition: 'transform 200ms ease',
            }}
          >
            <SidebarContents isDrawer />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
