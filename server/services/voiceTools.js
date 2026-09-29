const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cleanText = (value, field, maxLength = 160) => {
  if (typeof value !== 'string') throw new Error(`Invalid ${field}`);
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!cleaned || cleaned.length > maxLength) throw new Error(`Invalid ${field}`);
  return cleaned;
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

const searchProducts = async (Product, rawQuery) => {
  const query = cleanText(rawQuery, 'product query', 80);
  const pattern = new RegExp(escapeRegex(query), 'i');
  const products = await Product.find({
    isActive: true,
    $or: [
      { name: pattern },
      { categoryName: pattern },
      { sku: pattern },
      { description: pattern },
    ],
  }).select('name sku categoryName price discountPrice stock isActive').limit(5).lean();

  return products.map((product) => ({
    id: String(product._id),
    name: product.name,
    sku: product.sku,
    category: product.categoryName || '',
    price: product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price,
    stock: product.stock,
    available: product.stock > 0,
  }));
};

const lookupOrder = async (Order, input) => {
  const orderId = cleanText(input.orderId, 'order reference', 40).toUpperCase();
  const phone = normalizePhone(cleanText(input.phone, 'phone number', 24));
  const postalCode = cleanText(input.postalCode, 'postal code', 20).toLowerCase();
  if (phone.length < 10) throw new Error('Invalid phone number');

  const order = await Order.findOne({ orderId })
    .select('orderId status items.name items.quantity shippingInfo.phone shippingInfo.postalCode createdAt')
    .lean();
  if (!order
    || normalizePhone(order.shippingInfo?.phone) !== phone
    || String(order.shippingInfo?.postalCode || '').trim().toLowerCase() !== postalCode) {
    return null;
  }

  return {
    orderId: order.orderId,
    status: order.status,
    items: (order.items || []).map(({ name, quantity }) => ({ name, quantity })),
    placedAt: order.createdAt,
  };
};

const validateVoiceOrderDetails = (input) => {
  if (!input || typeof input !== 'object') throw new Error('Invalid order details');
  const email = cleanText(input.email, 'email', 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Invalid email address');
  const phone = cleanText(input.phone, 'phone number', 24);
  if (normalizePhone(phone).length < 10) throw new Error('Invalid phone number');

  const fields = ['name', 'address', 'city', 'state', 'postalCode', 'country'];
  const customer = {};
  for (const field of fields) customer[field] = cleanText(input[field], field, field === 'address' ? 240 : 100);

  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 5) {
    throw new Error('Order must contain between one and five products');
  }
  const items = input.items.map((item) => {
    const productId = cleanText(item.productId, 'product identifier', 80);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error('Invalid product quantity');
    }
    return { productId, quantity };
  });

  return { ...customer, email, phone, items };
};

const validateVoiceOrderRequest = (input) => {
  if (input.confirmed !== true) throw new Error('Customer confirmation is required');
  if (input.consent !== true) throw new Error('Customer consent is required before storing contact details');
  return validateVoiceOrderDetails(input);
};

module.exports = { cleanText, normalizePhone, searchProducts, lookupOrder, validateVoiceOrderDetails, validateVoiceOrderRequest };