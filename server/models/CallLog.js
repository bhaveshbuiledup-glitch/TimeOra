const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  provider: { type: String, enum: ['twilio'], required: true },
  providerCallId: { type: String, required: true, unique: true },
  source: { type: String, enum: ['website', 'phone'], default: 'phone' },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'],
    default: 'initiated',
  },
  language: { type: String, enum: ['en', 'hi', 'gu'], default: 'en' },
  outcome: { type: String, enum: ['unresolved', 'answered', 'order-created', 'handoff-requested', 'error'], default: 'unresolved' },
  durationSeconds: { type: Number, min: 0, default: 0 },
  customer: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, maxlength: 120 },
    email: { type: String, maxlength: 254 },
    phone: { type: String, maxlength: 24 },
    consented: { type: Boolean, default: false },
  },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  handoffRequestedAt: { type: Date },
  handoffReason: { type: String, maxlength: 300 },
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true });

callLogSchema.index({ createdAt: -1 });
callLogSchema.index({ outcome: 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);