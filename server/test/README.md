# TIMEORA Watch Store - Test Suite

## Running Tests

```bash
# Server tests
cd watch-store/server
node test/runTests.js
```

## Test Coverage

### Authentication
- [ ] Register with valid data
- [ ] Register with duplicate email
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token verification
- [ ] Protected route access
- [ ] Admin route access

### Products
- [ ] Fetch all products
- [ ] Fetch product by ID
- [ ] Search products
- [ ] Filter by category
- [ ] Create product (admin)
- [ ] Update product (admin)
- [ ] Delete product (admin)
- [ ] SKU uniqueness

### Orders
- [ ] Create order with valid cart
- [ ] Create order with insufficient stock
- [ ] Create order with invalid product
- [ ] Stock deduction on order
- [ ] Stock restoration on cancellation
- [ ] Order history
- [ ] Get single order
- [ ] Unauthorized order access

### Payments
- [ ] Razorpay signature verification
- [ ] Invalid signature rejection
- [ ] Webhook verification
- [ ] Duplicate webhook handling (idempotent)

### Coupons
- [ ] Valid coupon application
- [ ] Expired coupon rejection
- [ ] Usage limit enforcement
- [ ] Minimum amount validation

### Security
- [ ] Unauthorized admin endpoint
- [ ] Unauthorized upload
- [ ] Rate limiting
- [ ] Invalid request payload
- [ ] NoSQL injection prevention
- [ ] CORS restriction

## Adding New Tests

```javascript
// Add to test/runTests.js
const test = (name, fn) => {
  try {
    fn();
    passed.push(name);
  } catch (e) {
    failed.push(`${name}: ${e.message}`);
  }
};

test('My test name', () => {
  // test logic
  if (somethingWentWrong) throw new Error('Failed');
});
```
