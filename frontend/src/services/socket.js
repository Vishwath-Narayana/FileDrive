import { io } from 'socket.io-client';
import { supabase } from './supabaseClient';

// API URL is ".../api"; the socket server lives at the origin.
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const socket = io(BACKEND_URL, {
  // Connect only after login (AuthContext) - the server requires a token in the handshake.
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  transports: ['websocket', 'polling'],
  // Evaluated on every (re)connect, so a refreshed token is always used.
  auth: async (cb) => {
    const { data } = await supabase.auth.getSession();
    cb({ token: data.session?.access_token });
  },
});

// Several components (AuthContext, Dashboard, ManageOrgModal) need the same org room.
// Reference-count joins so one component unmounting does not drop the room for the others,
// and re-join everything after a reconnect (the server forgets rooms when it restarts or sleeps).
const joined = new Map();

export const joinOrg = (orgId) => {
  if (!orgId) return;
  const count = joined.get(orgId) || 0;
  joined.set(orgId, count + 1);
  if (count === 0 && socket.connected) socket.emit('join-org', orgId);
};

export const leaveOrg = (orgId) => {
  const count = joined.get(orgId) || 0;
  if (count <= 1) {
    joined.delete(orgId);
    if (socket.connected) socket.emit('leave-org', orgId);
  } else {
    joined.set(orgId, count - 1);
  }
};

socket.on('connect', () => {
  joined.forEach((_, orgId) => socket.emit('join-org', orgId));
});

socket.on('connect_error', (err) => {
  if (import.meta.env.DEV) console.warn('Socket connection error:', err.message);
});

export const connectSocket = () => {
  if (!socket.connected && !socket.active) socket.connect();
};

export const disconnectSocket = () => {
  joined.clear();
  socket.disconnect();
};

export default socket;
