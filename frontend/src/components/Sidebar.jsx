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
          height: '60px',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}
      >
        <img
          src={logo}
          alt="FileDrive Logo"
          style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '6px' }}
        />
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.01em' }}>
          FileDrive
        </span>

        {/* Close button (drawer only) */}
        {isDrawer && setDrawerOpen && (
          <button
            onClick={(e) => { e.stopPropagation(); setDrawerOpen(false); }}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '32px', height: '32px', borderRadius: '8px',
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9C9CA8', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1" style={{ padding: '16px 0' }}>
        <div style={{
          fontSize: '11px', fontWeight: 600, color: '#5C5C68',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '0 20px', margin: '0 0 8px',
        }}>
          Workspace
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === '/dashboard' && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`sidebar-nav-item nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom — org card */}
      <div style={{ padding: '12px' }}>
        <div
          className="flex items-center gap-2"
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: '8px', height: '8px',
              borderRadius: '50%', background: '#22C55E', flexShrink: 0,
            }}
          />
          <span
            className="truncate"
            style={{ fontSize: '13px', fontWeight: 500, color: '#D4D4D8' }}
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
        className="flex-col h-screen fixed left-0 top-0 z-50"
        style={{ width: '224px', display: 'none', background: '#111114', borderRight: '1px solid rgba(255,255,255,0.06)' }}
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
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 36px;
          padding: 0 14px;
          margin: 2px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          width: calc(100% - 24px);
          text-align: left;
          color: #9C9CA8;
          transition: background 120ms ease, color 120ms ease;
        }
        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: #F4F4F5;
        }
        .sidebar-nav-item-active {
          background: rgba(91,91,214,0.18);
          color: #ADA8FF;
          box-shadow: inset 2px 0 0 0 #7C7CF0;
        }
        .sidebar-nav-item-active:hover {
          background: rgba(91,91,214,0.22);
          color: #ADA8FF;
        }
      `}</style>

      <div
        className="sidebar-desktop h-screen fixed left-0 top-0 z-50"
        style={{ width: '224px', background: '#111114', borderRight: '1px solid rgba(255,255,255,0.06)' }}
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
              background: '#111114',
              zIndex: 50,
              borderRight: '1px solid rgba(255,255,255,0.06)',
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
