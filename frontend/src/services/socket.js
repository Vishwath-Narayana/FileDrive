import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5001';

console.log('🔌 Socket.io connecting to:', BACKEND_URL);

const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  transports: ['polling', 'websocket'],
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

export default socket;
