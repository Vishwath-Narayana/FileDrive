import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Users, ChevronRight } from 'lucide-react';
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

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[#EDEDED] text-gray-400 hover:text-black hover:border-black transition-all duration-200 group"
        title="Notifications"
      >
        <Bell size={18} className="group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-white rounded-[20px] shadow-2xl border border-[#F0F0F0] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F9F9F9]">
            {notifications.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={22} className="text-gray-200" />
                </div>
                <p className="text-sm font-bold text-gray-300">All caught up!</p>
                <p className="text-xs text-gray-200 mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`px-5 py-4 transition-colors duration-150 ${n.status === 'unread' ? 'bg-blue-50/30' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${n.type === 'invite' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {n.type === 'invite' ? <Users size={14} /> : <Bell size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black leading-snug">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {n.sender?.name && `from ${n.sender.name} · `}
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>

                      {/* Invite action buttons */}
                      {n.type === 'invite' && n.status === 'unread' && n.token && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleAcceptInvite(n)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition-all duration-200"
                          >
                            <Check size={12} strokeWidth={3} />
                            Join
                          </button>
                          <button
                            onClick={() => markRead(n._id)}
                            className="text-[11px] font-bold text-gray-400 hover:text-black px-3 py-2 rounded-full hover:bg-gray-50 transition-all duration-200"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>

                    {n.status === 'unread' && n.type !== 'invite' && (
                      <button
                        onClick={() => markRead(n._id)}
                        className="p-1.5 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all flex-shrink-0"
                        title="Mark as read"
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-[#F5F5F5]">
              <button
                onClick={async () => {
                  for (const n of notifications.filter(n => n.status === 'unread')) {
                    await markRead(n._id);
                  }
                }}
                className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
              >
                Mark all as read <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
