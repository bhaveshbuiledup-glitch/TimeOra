const test = require('node:test');
const assert = require('node:assert/strict');
const { createVoiceOrder, getVoiceOrderIdempotencyKey } = require('../services/voiceOrder');

const validInput = {
  confirmed: true, consent: true, name: 'Asha Patel', email: 'asha@example.com', phone: '+91 9876543210',
  address: '12 Main Road', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001', country: 'India',
  items: [{ productId: '507f1f77bcf86cd799439011', quantity: 1 }],
};

test('voice call reference is a stable retry idempotency key', () => {
  assert.equal(getVoiceOrderIdempotencyKey('CA12345678901234567890'), 'CA12345678901234567890');
  assert.equal(getVoiceOrderIdempotencyKey('CA12345678901234567890'), getVoiceOrderIdempotencyKey('CA12345678901234567890'));
  assert.throws(() => getVoiceOrderIdempotencyKey('invalid'), /call reference/);
});

test('retry returns the existing order without opening a transaction', async () => {
  const existing = { _id: 'existing-order', orderId: 'TM-ORD-123456', total: 8000 };
  const originalFindOne = require('../models/Order').findOne;
  const Order = require('../models/Order');
  Order.findOne = async () => existing;
  try {
    const result = await createVoiceOrder({ callSid: 'CA12345678901234567890', input: validInput, consented: true, confirmed: true });
    assert.equal(result.order, existing);
    assert.equal(result.duplicate, true);
  } finally {
    Order.findOne = originalFindOne;
  }
});

test('order creation service requires independent consent and confirmation flags', async () => {
  await assert.rejects(
    createVoiceOrder({ callSid: 'CA12345678901234567890', input: validInput }),
    /confirmation/,
  );
});