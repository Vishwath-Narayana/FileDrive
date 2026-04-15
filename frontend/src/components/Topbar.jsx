import { ChevronDown, LogOut, Plus, User, Menu, Settings, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Topbar = ({ onOpenAdminModal, onOpenCreateOrgModal, socket, setDrawerOpen }) => {
  const { user, logout, organizations, currentOrganization, switchOrganization } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const isPersonalOrg = currentOrganization?._id === 
    user?.personalOrganization?._id ||
    currentOrganization?.name?.includes("Personal");

  const isAdmin = currentOrganization &&
    currentOrganization._id !== user?.personalOrganization?._id &&
    currentOrganization._id !== user?.personalOrganization &&
    currentOrganization.members?.find(
      m => m.user._id === user?._id || m.user === user?._id
    )?.role === 'admin';

  const AvatarCircle = () => (
    <div
      style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: '#E8E8E6', color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 500, cursor: 'pointer',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : initials}
    </div>
  );

  return (
    <>
      <style>{`
        .topbar-desktop-left { display: flex; }
        .topbar-desktop-right { display: flex; }
        .topbar-mobile-left { display: none; }
        .topbar-mobile-center { display: none; }
        @media (max-width: 767px) {
          .topbar-desktop-left { display: none; }
          .topbar-desktop-right { display: none; }
          .topbar-mobile-left { display: flex; }
          .topbar-mobile-center { display: flex; }
        }
      `}</style>

      <div
        className="glass-effect"
        style={{
          height: '52px',
          padding: '0 20px 0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--border)',
          background: '#FFFFFF',
        }}
      >
        {/* ── DESKTOP LEFT — org switcher + manage ── */}
        <div className="topbar-desktop-left" style={{ alignItems: 'center', gap: '4px' }}>
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0 border-0 bg-transparent"
              id="org-dropdown"
            >
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentOrganization?.name || 'Select Organization'}
                </span>
                <ChevronDown size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} strokeWidth={2} />
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="shadow-xl py-1 mt-1"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '10px',
                minWidth: '220px',
                background: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                padding: '6px',
              }}
            >
              <div style={{ padding: '6px 10px 4px', fontSize: '11px', fontWeight: 500, color: '#9CA3AF', letterSpacing: '0.04em' }}>
                Organizations
              </div>
              {organizations.map((org) => (
                <Dropdown.Item
                  key={org._id}
                  onClick={() => switchOrganization(org)}
                  active={false}
                  style={{
                    height: '32px', padding: '0 10px', fontSize: '13px', borderRadius: '6px',
                    background: currentOrganization?._id === org._id ? '#F7F7F5' : 'transparent',
                    color: '#1A1A1A',
                    fontWeight: 400,
                    transition: 'background 100ms ease',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (currentOrganization?._id !== org._id) e.currentTarget.style.background = '#F7F7F5'; }}
                  onMouseLeave={e => { if (currentOrganization?._id !== org._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {currentOrganization?._id === org._id ? (
                    <Check size={12} style={{ color: '#1A1A1A', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: '12px', flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {org.name}
                  </span>
                </Dropdown.Item>
              ))}
              <div style={{ height: '1px', background: '#E8E8E6', margin: '4px 0' }} />
              <Dropdown.Item
                onClick={onOpenCreateOrgModal}
                style={{
                  height: '32px', padding: '0 10px', fontSize: '13px', borderRadius: '6px',
                  color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F7F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={13} style={{ color: '#6B6B6B', flexShrink: 0 }} />
                Create new workspace
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </div>

        {/* ── MOBILE LEFT — hamburger ── */}
        <div className="topbar-mobile-left" style={{ alignItems: 'center' }}>
          <button
            className="topbar-icon-btn"
            onClick={() => setDrawerOpen && setDrawerOpen(true)}
            style={{
              width: '32px', height: '32px', borderRadius: '6px',
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* ── MOBILE CENTER — FileDrive title ── */}
        <div
          className="topbar-mobile-center"
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>FileDrive</span>
        </div>

        {/* ── DESKTOP RIGHT — bell + avatar ── */}
        <div className="topbar-desktop-right" style={{ alignItems: 'center', gap: '8px' }}>
          {!isPersonalOrg && (
            <button
              onClick={onOpenAdminModal}
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '5px 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                lineHeight: '1',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              Manage organization
            </button>
          )}
          <NotificationBell socket={socket} />

          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0 border-0 bg-transparent"
              id="user-dropdown"
            >
              <AvatarCircle />
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="shadow-lg py-1 mt-1"
              style={{
                border: '1px solid var(--border)', borderRadius: '10px',
                minWidth: '200px', background: 'var(--bg-surface)',
              }}
            >
              <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{user?.email}</div>
              </div>
              <Dropdown.Item
                onClick={() => navigate('/settings')}
                style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <User size={14} style={{ color: 'var(--text-tertiary)' }} />
                Account settings
              </Dropdown.Item>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <Dropdown.Item
                onClick={handleLogout}
                style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LogOut size={14} />
                Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* ── MOBILE RIGHT — avatar only ── */}
        <div style={{ display: 'none' }} className="topbar-mobile-right">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0 border-0 bg-transparent"
              id="user-dropdown-mobile"
            >
              <AvatarCircle />
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="shadow-lg py-1 mt-1"
              style={{ border: '1px solid var(--border)', borderRadius: '10px', minWidth: '200px', background: 'var(--bg-surface)' }}
            >
              <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{user?.email}</div>
              </div>
              <Dropdown.Item onClick={() => navigate('/settings')} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} style={{ color: 'var(--text-tertiary)' }} /> Account settings
              </Dropdown.Item>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <Dropdown.Item onClick={handleLogout} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={14} /> Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

      </div>
      <style>{`
        .topbar-mobile-right { display: none !important; }
        @media (max-width: 767px) {
          .topbar-mobile-right { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Topbar;
