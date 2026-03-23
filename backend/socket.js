/**
 * Socket.io singleton — import getIO() in controllers to emit events.
 * Call initIO(httpServer) once in server.js at startup.
 */
const { Server } = require('socket.io');

let io;

const initIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Client joins an org-specific room
    socket.on('join-org', (orgId) => {
      socket.join(`org:${orgId}`);
      console.log(`➕ ${socket.id} joined org:${orgId}`);
    });

    // Client leaves the org room (org switch / unmount)
    socket.on('leave-org', (orgId) => {
      socket.leave(`org:${orgId}`);
      console.log(`➖ ${socket.id} left org:${orgId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized — call initIO(server) first');
  return io;
};

module.exports = { initIO, getIO };
