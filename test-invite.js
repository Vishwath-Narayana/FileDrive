const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Organization = require('./backend/models/Organization');
const Invitation = require('./backend/models/Invitation');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/filedrive');
  console.log('Connected to DB');

  const org = await Organization.findOne();
  const owner = await User.findById(org.owner);
  
  const token = 'TEST_TOKEN_' + Date.now();
  
  // Create an invitation
  const invite = await Invitation.create({
    organization: org._id,
    email: 'test@example.com',
    role: 'editor',
    invitedBy: owner._id,
    token: token
  });
  console.log('Created invite:', invite.token);

  // Now emulate user who got created during login
  let user = await User.create({
    supabaseId: 'sub-test-' + Date.now(),
    email: 'test@example.com',
    name: 'Testy'
  });
  console.log('Created user:', user._id);

  // Now let's try the backend endpoint logic!
  const res = {
    status: (code) => { console.log('STATUS:', code); return res; },
    json: (data) => { console.log('JSON:', data); return res; }
  };
  const req = { body: { token } };
  
  const { acceptInviteByToken } = require('./backend/controllers/organizationController');
  
  console.log('Calling acceptInviteByToken...');
  await acceptInviteByToken(req, res);
  
  const updatedOrg = await Organization.findById(org._id);
  console.log('Org members:', updatedOrg.members.map(m => m.user.toString()));
  
  console.log('Done');
  process.exit();
}
test().catch(console.error);
