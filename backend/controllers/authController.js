const User = require('../models/User');
const Organization = require('../models/Organization');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('personalOrganization');
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
