const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Invitation = require('./backend/models/Invitation');

async function inspect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/filedrive');
    const users = await User.find().select('email');
    const invites = await Invitation.find().select('email status token');
    
    console.log('--- USERS ---');
    users.forEach(u => console.log(u.email));
    console.log('--- INVITES ---');
    invites.forEach(i => console.log(i));
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

inspect();
