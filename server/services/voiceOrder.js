const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { TaxConfig, ShippingConfig } = require('../models/Setting');
const { validateVoiceOrderDetails, validateVoiceOrderRequest } = require('./voiceTools');

const getVoiceOrderIdempotencyKey = (callSid) => {
  if (!/^CA[A-Za-z0-9]{10,40}$/.test(String(callSid || ''))) throw new Error('Invalid call reference');
  return callSid;
};

const getVoiceOrderQuote = async (input) => {
  const customer = validateVoiceOrderDetails(input);
  const orderItems = [];
  let subtotal = 0;
  for (const item of customer.items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) throw new Error('Invalid product reference');
    const product = await Product.findOne({ _id: item.productId, isActive: true }).select('name price discountPrice stock').lean();
    if (!product) throw new Error('A requested product is unavailable');
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
    const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
    subtotal += price * item.quantity;
    orderItems.push({ productId: String(product._id), name: product.name, price, quantity: item.quantity });
  }
  const [taxConfig, shippingConfig] = await Promise.all([
    TaxConfig.findOne().sort({ createdAt: -1 }).lean(),
    ShippingConfig.findOne().sort({ createdAt: -1 }).lean(),
  ]);
  const taxRate = taxConfig?.taxRate ?? 0.18;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const shippingCost = subtotal >= (shippingConfig?.freeShippingThreshold ?? 5000)
    ? 0
    : (shippingConfig?.standardRate ?? 200);
  return {
    customer,
    quote: { items: orderItems, subtotal, taxAmount, shippingCost, total: subtotal + taxAmount + shippingCost },
  };
};

const createVoiceOrder = async ({ callSid, input, consented, confirmed, acceptedQuote }) => {
  const customer = validateVoiceOrderRequest({ ...input, consent: consented, confirmed });
  const stableKey = getVoiceOrderIdempotencyKey(callSid);
  const existingOrder = await Order.findOne({ voiceIdempotencyKey: stableKey });
  if (existingOrder) return { order: existingOrder, duplicate: true };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const orderItems = [];
    let subtotal = 0;

    for (const item of customer.items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) throw new Error('Invalid product reference');
      const product = await Product.findOne({ _id: item.productId, isActive: true }).session(session);
      if (!product) throw new Error('A requested product is unavailable');
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      const price = product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        image: product.images?.[0] || '',
        price,
        discountPrice: product.discountPrice || null,
        quantity: item.quantity,
        selectedColor: 'Standard',
      });
    }

    const [taxConfig, shippingConfig] = await Promise.all([
      TaxConfig.findOne().sort({ createdAt: -1 }).session(session),
      ShippingConfig.findOne().sort({ createdAt: -1 }).session(session),
    ]);
    const taxRate = taxConfig?.taxRate ?? 0.18;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const freeThreshold = shippingConfig?.freeShippingThreshold ?? 5000;
    const shippingCost = subtotal >= freeThreshold ? 0 : (shippingConfig?.standardRate ?? 200);
    const total = subtotal + taxAmount + shippingCost;
    if (!acceptedQuote || acceptedQuote.total !== total
      || acceptedQuote.items.length !== orderItems.length
      || orderItems.some((item) => !acceptedQuote.items.some((quoted) => (
        quoted.productId === String(item.product)
        && quoted.price === item.price
        && quoted.quantity === item.quantity
      )))) {
      throw new Error('The product price or availability changed after review; please prepare a new order quote');
    }
    const orderId = `TM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const [firstName, ...lastNameParts] = customer.name.split(/\s+/);
    const lastName = lastNameParts.join(' ') || firstName;
    const shippingInfo = {
      firstName,
      lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
      orderNotes: 'Order placed with customer confirmation through TIMEORA AI voice support.',
    };
    const [order] = await Order.create([{
      user: null,
      orderId,
      items: orderItems,
      shippingInfo,
      billingInfo: { firstName, lastName, address: customer.address, city: customer.city, country: customer.country },
      shippingMethod: 'standard',
      shippingCost,
      paymentMethod: 'cod',
      subtotal,
      discountAmount: 0,
      taxableAmount: subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'pending',
      orderStatusHistory: [{ status: 'pending', note: 'AI voice order created after explicit customer confirmation' }],
      isGuest: true,
      guestEmail: customer.email,
      source: 'voice',
      voiceIdempotencyKey: stableKey,
    }], { session });

    for (const item of customer.items) {
      const updated = await Product.updateOne(
        { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session },
      );
      if (updated.modifiedCount !== 1) throw new Error('Stock changed while placing the order; please try again');
    }

    await session.commitTransaction();
    return { order, duplicate: false };
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      const duplicate = await Order.findOne({ voiceIdempotencyKey: stableKey });
      if (duplicate) return { order: duplicate, duplicate: true };
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = { createVoiceOrder, getVoiceOrderIdempotencyKey, getVoiceOrderQuote };