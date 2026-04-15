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

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      className="glass-effect flex items-center justify-between sticky top-0 z-[40]"
      style={{
        height: '52px',
        padding: '0 20px',
        marginLeft: '200px',
      }}
    >
      {/* Left — org switcher */}
      <div className="flex items-center gap-3">
        <Dropdown>
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id="org-dropdown"
          >
            <div
              className="flex items-center gap-1.5 cursor-pointer"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }} className="max-w-[180px] truncate">
                {currentOrganization?.name || 'Select Organization'}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} strokeWidth={2} />
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="shadow-xl py-1 mt-1"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '10px',
              minWidth: '220px',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ padding: '6px 12px 4px', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
              Organizations
            </div>
            {organizations.map((org) => (
              <Dropdown.Item
                key={org._id}
                onClick={() => switchOrganization(org)}
                active={false}
                style={{
                  padding: '7px 12px',
                  fontSize: '13px',
                  margin: '1px 4px',
                  borderRadius: '6px',
                  background: currentOrganization?._id === org._id ? 'var(--bg-hover)' : 'transparent',
                  color: currentOrganization?._id === org._id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: currentOrganization?._id === org._id ? 500 : 400,
                  transition: 'background 100ms ease',
                }}
              >
                {org.name}
              </Dropdown.Item>
            ))}
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
            <Dropdown.Item
              onClick={onOpenCreateOrgModal}
              style={{
                padding: '7px 12px',
                fontSize: '13px',
                margin: '1px 4px',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '20px', height: '20px', borderRadius: '5px',
                  background: 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Plus size={12} style={{ color: 'var(--text-secondary)' }} />
              </div>
              Create new
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Manage button (admin only, non-personal org) */}
        {currentOrganization &&
         currentOrganization._id !== user?.personalOrganization?._id &&
         currentOrganization._id !== user?.personalOrganization &&
         currentOrganization.members?.find(
          m => m.user._id === user?._id || m.user === user?._id
        )?.role === 'admin' && (
          <button
            onClick={onOpenAdminModal}
            style={{
              fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '6px 10px', borderRadius: '6px', transition: 'background 150ms ease, color 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Manage
          </button>
        )}
      </div>

      {/* Right — bell + avatar */}
      <div className="flex items-center gap-2">
        <NotificationBell socket={socket} />

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id="user-dropdown"
          >
            <div
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#E8E8E6', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="shadow-lg py-1 mt-1"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '10px',
              minWidth: '200px',
              background: 'var(--bg-surface)',
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
    </div>
  );
};

export default Topbar;
