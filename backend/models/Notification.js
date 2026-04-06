const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['invite', 'file', 'system'],
    default: 'system'
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  token: {
    type: String
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
