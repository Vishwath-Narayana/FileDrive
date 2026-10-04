/**
 * Socket.io singleton. Sockets must present a valid Supabase access token in the
 * handshake (auth.token). Each socket joins a private `user:<id>` room, and may
 * join `org:<id>` rooms only for organizations it is a member of.
 */
const { Server } = require('socket.io');
const Organization = require('./models/Organization');
const { verifyAccessToken, needsMfaUpgrade } = require('./utils/auth');
const { resolveUser } = require('./middlewares/authMiddleware');
const { allowedOrigins } = require('./config/env');

let io;

const initIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins(), methods: ['GET', 'POST'], credentials: true },
    // Hosts that sleep/proxy idle connections drop quiet sockets; ping often.
    pingInterval: 20_000,
    pingTimeout: 25_000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('unauthorized'));
      const payload = await verifyAccessToken(token);
      if (await needsMfaUpgrade(payload)) return next(new Error('mfa_required'));
      const user = await resolveUser(payload, { create: false });
      if (!user) return next(new Error('unauthorized'));
      socket.data.userId = user._id.toString();
      next();
    } catch (e) {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    socket.on('join-org', async (orgId, ack) => {
      try {
        const isMember = await Organization.exists({ _id: orgId, 'members.user': userId });
        if (!isMember) return ack?.({ ok: false });
        socket.join(`org:${orgId}`);
        ack?.({ ok: true });
      } catch {
        ack?.({ ok: false });
      }
    });

    socket.on('leave-org', (orgId) => socket.leave(`org:${orgId}`));
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized — call initIO(server) first');
  return io;
};

// Emit to every socket of one user (all their tabs/devices).
const emitToUser = (userId, event, payload) => {
  try {
    getIO().to(`user:${userId}`).emit(event, payload);
  } catch (e) {
    console.warn('emitToUser skipped:', e.message);
  }
};

const emitToOrg = (orgId, event, payload) => {
  try {
    getIO().to(`org:${orgId}`).emit(event, payload);
  } catch (e) {
    console.warn('emitToOrg skipped:', e.message);
  }
};

// Stop a removed member's sockets from receiving further org events.
const removeUserFromOrgRoom = (userId, orgId) => {
  try {
    getIO().in(`user:${userId}`).socketsLeave(`org:${orgId}`);
  } catch (e) {
    console.warn('removeUserFromOrgRoom skipped:', e.message);
  }
};

const closeOrgRoom = (orgId) => {
  try {
    getIO().in(`org:${orgId}`).socketsLeave(`org:${orgId}`);
  } catch (e) {
    console.warn('closeOrgRoom skipped:', e.message);
  }
};

module.exports = { initIO, getIO, emitToUser, emitToOrg, removeUserFromOrgRoom, closeOrgRoom };
