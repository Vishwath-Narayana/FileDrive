import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = ({ socket }) => {
  const { user, refreshOrganizations } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
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
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        title="Notifications"
        style={{
          width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '6px', border: 'none',
          background: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Bell size={16} strokeWidth={1.75} />

        {/* Unread dot badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px',
              borderRadius: '50%', background: '#EF4444',
              border: '1.5px solid white',
            }}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: '40px',
            width: '320px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: '24px', height: '24px', borderRadius: '4px',
                border: 'none', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)', cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={13} />
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--bg-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}
                >
                  <Bell size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                  All caught up
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 100ms ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {/* Unread indicator dot */}
                    <div style={{ flexShrink: 0, paddingTop: '6px' }}>
                      {n.status === 'unread' ? (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                      ) : (
                        <div style={{ width: '6px', height: '6px' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                        {n.sender?.name && `${n.sender.name} · `}{formatTime(n.createdAt)}
                      </p>

                      {/* Invite actions */}
                      {n.type === 'invite' && n.status === 'unread' && n.token && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button
                            onClick={() => handleAcceptInvite(n)}
                            style={{
                              height: '24px', padding: '0 10px',
                              background: 'var(--brand)', color: 'white',
                              border: 'none', borderRadius: '4px',
                              fontSize: '11px', fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                          >
                            <Check size={10} strokeWidth={3} />
                            Join
                          </button>
                          <button
                            onClick={() => markRead(n._id)}
                            style={{
                              height: '24px', padding: '0 10px',
                              background: 'transparent', color: 'var(--text-secondary)',
                              border: '1px solid var(--border)', borderRadius: '4px',
                              fontSize: '11px', fontWeight: 400,
                              cursor: 'pointer',
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
                          width: '24px', height: '24px', borderRadius: '4px',
                          border: 'none', background: 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-tertiary)', cursor: 'pointer', flexShrink: 0,
                          transition: 'background 150ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
                  fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
