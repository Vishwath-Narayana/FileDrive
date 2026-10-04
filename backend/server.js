require('dotenv').config();
const { validateEnv, allowedOrigins } = require('./config/env');
validateEnv();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { initIO } = require('./socket');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// Render/Fly/Railway terminate TLS in front of us; needed for correct client IPs (rate limiting).
app.set('trust proxy', 1);

initIO(server);

app.use(helmet());

const origins = allowedOrigins();
app.use(
  cors({
    origin: (origin, cb) => {
      // No Origin header = same-origin / curl / health checks
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Liveness/readiness for the host's health check (also useful for an uptime pinger).
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ ok: dbUp, db: dbUp ? 'up' : 'down', uptime: Math.round(process.uptime()) });
});

app.get('/', (req, res) => {
  res.json({ message: 'File Sharing API is running' });
});

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests, slow down' },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
};
start();

// Hosts send SIGTERM on deploy/scale-down: stop accepting work, then exit cleanly.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.connection.close().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
