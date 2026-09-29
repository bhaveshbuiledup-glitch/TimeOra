const test = require('node:test');
const assert = require('node:assert/strict');
const {
  lookupOrder,
  searchProducts,
  validateVoiceOrderRequest,
} = require('../services/voiceTools');

test('product search returns only backend prices and stock', async () => {
  let capturedQuery;
  const Product = {
    find(query) {
      capturedQuery = query;
      return {
        select() { return this; },
        limit() { return this; },
        async lean() {
          return [{ _id: 'p1', name: 'TIMEORA One', sku: 'TM-1', price: 200, discountPrice: 150, stock: 2 }];
        },
      };
    },
  };

  const results = await searchProducts(Product, 'TIMEORA');
  assert.equal(capturedQuery.isActive, true);
  assert.equal(results[0].price, 150);
  assert.equal(results[0].stock, 2);
  assert.equal(results[0].available, true);
});

test('order lookup requires both matching phone and postal code', async () => {
  const Order = {
    findOne() {
      return {
        select() { return this; },
        async lean() {
          return {
            orderId: 'TM-ORD-123456', status: 'shipped',
            items: [{ name: 'TIMEORA One', quantity: 1 }],
            shippingInfo: { phone: '+91 9876543210', postalCode: '380001' },
          };
        },
      };
    },
  };

  assert.equal(await lookupOrder(Order, {
    orderId: 'tm-ord-123456', phone: '9876543210', postalCode: '380002',
  }), null);
  const match = await lookupOrder(Order, {
    orderId: 'tm-ord-123456', phone: '9876543210', postalCode: '380001',
  });
  assert.equal(match.status, 'shipped');
});

test('voice order requires explicit confirmation and validates collected details', () => {
  const order = {
    confirmed: true, consent: true, name: 'Asha Patel', email: 'asha@example.com', phone: '+91 9876543210',
    address: '12 Main Road', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001', country: 'India',
    items: [{ productId: '507f1f77bcf86cd799439011', quantity: 1 }],
  };

  assert.throws(() => validateVoiceOrderRequest({ ...order, confirmed: false }), /confirmation/);
  assert.throws(() => validateVoiceOrderRequest({ ...order, consent: false }), /consent/);
  assert.equal(validateVoiceOrderRequest(order).items[0].quantity, 1);
  assert.throws(() => validateVoiceOrderRequest({ ...order, items: [{ productId: 'x', quantity: 0 }] }), /quantity/);
});