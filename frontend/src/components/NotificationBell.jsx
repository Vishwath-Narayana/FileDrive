import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Users, Upload, Trash2, Star, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = ({ socket }) => {
  const { user, refreshOrganizations } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Real-time via Socket.io
  useEffect(() => {
    if (!socket || !user) return;

    const eventName = `notification:new:${user._id}`;
    socket.on(eventName, (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.off(eventName);
  }, [socket, user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/organizations/notifications');
      setNotifications(res.data);
    } catch (_) {}
  };

  const markRead = async (id) => {
    try {
      await api.put(`/organizations/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, status: 'read' } : n)
      );
    } catch (_) {}
  };

  const handleAcceptInvite = async (notification) => {
    try {
      await api.post('/organizations/accept-invite', { token: notification.token });
      await markRead(notification._id);
      await refreshOrganizations();
      toast.success('You joined the organization!');
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join organization');
    }
  };

  const formatTime = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'invite': return <UserPlus size={13} style={{ color: 'var(--accent-indigo)' }} />;
      case 'upload': return <Upload size={13} style={{ color: 'var(--accent-orange)' }} />;
      case 'delete': return <Trash2 size={13} style={{ color: 'var(--accent-red)' }} />;
      default: return <Bell size={13} style={{ color: 'var(--text-tertiary)' }} />;
    }
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => n.status === 'unread')
    : notifications;

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        title="Notifications"
        style={{
          width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.background = 'var(--bg-card-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
      >
        <Bell size={15} strokeWidth={1.75} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute', top: '-4px', right: '-4px',
              minWidth: '16px', height: '16px',
              borderRadius: '8px', background: 'var(--accent-orange)',
              border: '2px solid var(--bg-elevated)',
              fontSize: '9px', fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
        <style>{`
          @media (max-width: 767px) {
            .notif-dropdown {
              width: calc(100vw - 32px) !important;
              right: -8px !important;
            }
          }
        `}</style>
        <div
          className="notif-dropdown"
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: '360px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Notification Center
              </span>
              {unreadCount > 0 && (
                <span
                  className="sys-mono"
                  style={{
                    fontSize: '10px', fontWeight: 700, color: 'var(--accent-orange)',
                    padding: '2px 6px', borderRadius: '4px',
                    background: 'var(--accent-orange-soft)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: '24px', height: '24px', borderRadius: '6px',
                border: 'none', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)', cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={12} />
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0', padding: '8px 16px 0', borderBottom: '1px solid var(--border)' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '8px 12px', marginBottom: '-1px',
                  fontSize: '12px', fontWeight: filter === tab.key ? 600 : 400,
                  color: filter === tab.key ? 'var(--accent-indigo)' : 'var(--text-tertiary)',
                  background: 'transparent', border: 'none',
                  borderBottom: filter === tab.key ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                  cursor: 'pointer', transition: 'color 150ms ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 16px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Bell size={18} style={{ color: 'var(--text-quaternary)' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  All caught up
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', margin: '4px 0 0' }}>
                  No {filter === 'unread' ? 'unread ' : ''}notifications
                </p>
              </div>
            ) : (
              filtered.map(n => (
                <div
                  key={n._id}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: n.status === 'unread' ? 'rgba(255, 107, 0, 0.04)' : 'transparent',
                    transition: 'background 100ms ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.status === 'unread' ? 'rgba(255, 107, 0, 0.04)' : 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {/* Icon */}
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '1px',
                    }}>
                      {getNotifIcon(n.type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{
                          fontSize: '12px', fontWeight: n.status === 'unread' ? 500 : 400,
                          color: 'var(--text-primary)', margin: 0, lineHeight: 1.5,
                        }}>
                          {n.message}
                        </p>
                        {n.status === 'unread' && (
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: 'var(--accent-indigo)',
                            flexShrink: 0, marginTop: '6px',
                          }} />
                        )}
                      </div>
                      <p style={{
                        fontSize: '10px', color: 'var(--text-quaternary)', margin: '3px 0 0',
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
                      }}>
                        {n.sender?.name && `${n.sender.name} · `}{formatTime(n.createdAt)}
                      </p>

                      {/* Invite actions */}
                      {n.type === 'invite' && n.status === 'unread' && n.token && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                          <button
                            onClick={() => handleAcceptInvite(n)}
                            style={{
                              height: '26px', padding: '0 12px',
                              background: 'var(--accent-indigo)', color: 'white',
                              border: 'none', borderRadius: '6px',
                              fontSize: '11px', fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Check size={10} strokeWidth={3} />
                            Join
                          </button>
                          <button
                            onClick={() => markRead(n._id)}
                            style={{
                              height: '26px', padding: '0 12px',
                              background: 'transparent', color: 'var(--text-tertiary)',
                              border: '1px solid var(--border)', borderRadius: '6px',
                              fontSize: '11px', fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mark read (non-invite unread) */}
                    {n.status === 'unread' && n.type !== 'invite' && (
                      <button
                        onClick={() => markRead(n._id)}
                        title="Mark as read"
                        style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          border: 'none', background: 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-quaternary)', cursor: 'pointer', flexShrink: 0,
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--accent-indigo)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-quaternary)'; }}
                      >
                        <Check size={11} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={async () => {
                  for (const n of notifications.filter(n => n.status === 'unread')) {
                    await markRead(n._id);
                  }
                }}
                style={{
                  fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                MARK ALL READ
              </button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
