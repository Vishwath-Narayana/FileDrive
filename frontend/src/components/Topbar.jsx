import { ChevronDown, LogOut, Plus, User, Menu, Settings, Check, Search, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';

const Topbar = ({ onOpenAdminModal, onOpenCreateOrgModal, socket, setDrawerOpen, uploadCount = 0 }) => {
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
    currentOrganization.members?.find(
      m => {
        const memberUserId = m.user?._id?.toString() || m.user?.toString();
        return memberUserId === user?._id?.toString();
      }
    )?.role === 'admin';

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
          height: '56px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* ── DESKTOP LEFT — org switcher ── */}
        <div className="topbar-desktop-left" style={{ alignItems: 'center', gap: '12px' }}>
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0 border-0 bg-transparent"
              id="org-dropdown"
            >
              <div
                className="flex items-center gap-2 cursor-pointer"
                style={{
                  padding: '6px 10px 6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-indigo-soft)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--accent-indigo)', flexShrink: 0,
                  boxShadow: '0 0 6px rgba(255, 107, 0, 0.5)',
                }} />
                <span style={{
                  fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                  maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {currentOrganization?.name || 'Select Organization'}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} strokeWidth={2} />
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="shadow-xl py-1 mt-1"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                minWidth: '220px',
                background: 'var(--bg-surface)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                padding: '6px',
              }}
            >
              <div className="sys-label" style={{ padding: '6px 10px 4px' }}>
                Organizations
              </div>
              {organizations.map((org) => (
                <Dropdown.Item
                  key={org._id}
                  onClick={() => switchOrganization(org)}
                  active={false}
                  style={{
                    height: '32px', padding: '0 10px', fontSize: '13px', borderRadius: '8px',
                    background: currentOrganization?._id === org._id ? 'var(--accent-indigo-soft)' : 'transparent',
                    color: currentOrganization?._id === org._id ? 'var(--accent-indigo-hover)' : 'var(--text-secondary)',
                    fontWeight: currentOrganization?._id === org._id ? 500 : 400,
                    transition: 'background 100ms ease',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (currentOrganization?._id !== org._id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (currentOrganization?._id !== org._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {currentOrganization?._id === org._id ? (
                    <Check size={12} style={{ color: 'var(--accent-indigo)', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: '12px', flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {org.name}
                  </span>
                </Dropdown.Item>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <Dropdown.Item
                onClick={onOpenCreateOrgModal}
                style={{
                  height: '32px', padding: '0 10px', fontSize: '13px', borderRadius: '6px',
                  color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                Create workspace
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Manage org button */}
          {!isPersonalOrg && isAdmin && (
            <button
              onClick={onOpenAdminModal}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
                color: 'var(--accent-indigo)',
                background: 'var(--accent-indigo-soft)',
                border: '1px solid rgba(255, 107, 0, 0.2)',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                lineHeight: '1',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 107, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--accent-indigo-soft)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.2)';
              }}
            >
              MANAGE
            </button>
          )}
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
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>FileDrive</span>
        </div>

        {/* ── DESKTOP RIGHT — notifications + avatar ── */}
        <div className="topbar-desktop-right" style={{ alignItems: 'center', gap: '8px' }}>
          <NotificationBell socket={socket} />

          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="text-decoration-none p-0 border-0 bg-transparent"
              id="user-dropdown"
            >
              <Avatar
                initials={initials}
                avatarUrl={user?.avatar}
                alt={user?.name}
                background="var(--bg-card)"
                color="var(--text-secondary)"
                style={{ border: '1px solid var(--border)' }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="shadow-lg py-1 mt-1"
              style={{
                border: '1px solid var(--border)', borderRadius: '12px',
                minWidth: '200px', background: 'var(--bg-surface)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{user?.email}</div>
              </div>
              <Dropdown.Item
                onClick={() => navigate('/settings')}
                style={{
                  padding: '7px 14px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={14} style={{ color: 'var(--text-tertiary)' }} />
                Settings
              </Dropdown.Item>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <Dropdown.Item
                onClick={handleLogout}
                style={{
                  padding: '7px 14px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px',
                  color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-red-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
              <Avatar
                initials={initials}
                avatarUrl={user?.avatar}
                alt={user?.name}
                background="var(--bg-card)"
                color="var(--text-secondary)"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="shadow-lg py-1 mt-1"
              style={{ border: '1px solid var(--border)', borderRadius: '10px', minWidth: '200px', background: 'var(--bg-surface)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
            >
              <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{user?.email}</div>
              </div>
              <Dropdown.Item onClick={() => navigate('/settings')} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} style={{ color: 'var(--text-tertiary)' }} /> Account settings
              </Dropdown.Item>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <Dropdown.Item onClick={handleLogout} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
