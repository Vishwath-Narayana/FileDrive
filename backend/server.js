require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { initIO } = require('./socket');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initIO(server);

connectDB();

app.use(cors()); // frontend connection 
app.use(express.json()); //read JSON 
app.use(express.urlencoded({ extended: true })); //read URL encoded data

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //serve static files

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);

app.get('/', async (req, res) => {
  try {
    const Invitation = require('./models/Invitation');
    const User = require('./models/User');
    const users = await User.find({}, 'email name supabaseId');
    const invites = await Invitation.find({}, 'email status token organization');
    console.log('--- DB DUMP START ---');
    console.log('USERS:', users);
    console.log('INVITES:', invites);
    console.log('--- DB DUMP END ---');
  } catch(e) {
    console.error(e);
  }
  res.json({ message: 'File Sharing API is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
