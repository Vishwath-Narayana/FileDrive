const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const personalOrg = await Organization.create({
      name: `${name}'s Personal`,
      owner: user._id,
      members: [{
        user: user._id,
        role: 'admin'
      }]
    });

    user.personalOrganization = personalOrg._id;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      personalOrganization: personalOrg._id,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('personalOrganization');
    if (!user) {
      return res.status(404).json({ message: "Account doesn't exist. Please create an account." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const organizations = await Organization.find({
      'members.user': user._id
    }).select('name owner members');

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      personalOrganization: user.personalOrganization,
      organizations: organizations,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('personalOrganization');
    const organizations = await Organization.find({
      'members.user': user._id
    }).select('name owner members');
    
    res.json({
      ...user.toObject(),
      organizations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
