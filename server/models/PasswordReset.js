const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
  },
  ipAddress: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
