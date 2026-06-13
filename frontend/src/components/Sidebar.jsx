import { LayoutDashboard, File, Star, Trash2, Upload, Settings, X, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab, drawerOpen, setDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganization } = useAuth();

  const mainItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'all', label: 'Files', icon: File },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const handleNavClick = (id) => {
    if (id === 'settings') {
      navigate('/settings');
    } else {
      navigate('/dashboard', { state: { tab: id } });
    }
    if (setDrawerOpen) setDrawerOpen(false);
  };

  const SidebarContents = ({ isDrawer = false }) => (
    <>
      {/* Logo area */}
      <div
        onClick={() => { navigate('/dashboard'); if (isDrawer && setDrawerOpen) setDrawerOpen(false); }}
        className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
        style={{
          height: '60px',
          padding: '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <img
          src={logo}
          alt="FileDrive Logo"
          style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '6px' }}
        />
        <span style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          FileDrive
        </span>
        <span style={{
          fontSize: '9px', fontWeight: 600, color: 'var(--accent-indigo)',
          background: 'var(--accent-indigo-soft)',
          padding: '2px 6px', borderRadius: '4px',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
        }}>
          PRO
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
      <nav className="flex-1" style={{ padding: '16px 0', overflowY: 'auto' }}>
        <div className="sys-label" style={{ padding: '0 20px', margin: '0 0 8px' }}>
          Workspace
        </div>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === '/dashboard' && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`sidebar-nav-item nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
              style={{ position: 'relative' }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: '0px',
                  top: '0px',
                  bottom: '0px',
                  width: '3px',
                  borderRadius: '0 4px 4px 0',
                  background: 'var(--accent-indigo)',
                }} />
              )}
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '16px 16px' }} />

        <div className="sys-label" style={{ padding: '0 20px', margin: '0 0 8px' }}>
          System
        </div>
        <button
          onClick={() => handleNavClick('settings')}
          className={`sidebar-nav-item nav-item ${location.pathname === '/settings' ? 'sidebar-nav-item-active' : ''}`}
          style={{ position: 'relative' }}
        >
          {location.pathname === '/settings' && (
            <div style={{
              position: 'absolute',
              left: '0px',
              top: '0px',
              bottom: '0px',
              width: '3px',
              borderRadius: '0 4px 4px 0',
              background: 'var(--accent-indigo)',
            }} />
          )}
          <Settings size={15} strokeWidth={location.pathname === '/settings' ? 2 : 1.75} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Bottom — org status card */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="flex items-center gap-3"
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="live-dot" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              className="truncate"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}
            >
              {currentOrganization?.name || 'Personal'}
            </span>
            <span className="sys-label" style={{ fontSize: '9px', marginTop: '2px', display: 'block' }}>
              ACTIVE · ONLINE
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
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
          color: var(--text-tertiary);
          transition: background 120ms ease, color 120ms ease;
        }
        .sidebar-nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .sidebar-nav-item-active {
          background: var(--accent-indigo-soft);
          color: var(--accent-indigo-hover);
        }
        .sidebar-nav-item-active:hover {
          background: rgba(255, 107, 0, 0.2);
          color: var(--accent-indigo-hover);
        }
      `}</style>

      <div
        className="sidebar-desktop h-screen fixed left-0 top-0 z-50"
        style={{
          width: '224px',
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border-subtle)',
        }}
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
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />
          {/* Drawer panel */}
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: '240px',
              background: 'var(--bg-elevated)',
              zIndex: 50,
              borderRight: '1px solid var(--border-subtle)',
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
