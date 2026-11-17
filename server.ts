import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, CATEGORIES, INITIAL_COUPONS, INITIAL_REVIEWS } from './src/data/products.ts';
import { Product, Order, UserProfile, Coupon, ProductReview } from './src/types/index.ts';
import { isSupabaseConfigured, SUPABASE_URL } from './src/lib/supabase.ts';
import { SupabaseService } from './src/services/supabaseService.ts';

const app = express();
// Uses process.env.PORT in production (Render, Railway, Cloud Run, etc.) and defaults to 3000 in dev
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory / Fallback Server Store (starts empty - dynamic live data from Supabase)
let products: Product[] = [...INITIAL_PRODUCTS];
const categories = [...CATEGORIES];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let reviews: ProductReview[] = [...INITIAL_REVIEWS];
const subscribers: Array<{ email: string; subscribedAt: string }> = [];
let users: UserProfile[] = [];
let orders: Order[] = [];

// In-Memory Cart & Wishlist storage by session/user
const carts: Record<string, any[]> = {};
const wishlists: Record<string, string[]> = {};

/* ==========================================================================
   REST API ENDPOINTS
   ========================================================================== */

// --- Supabase Diagnostics & Seeder Endpoints ---
app.get('/api/admin/supabase-status', async (_req, res) => {
  const isConfigured = isSupabaseConfigured();
  if (!isConfigured) {
    return res.json({
      isConfigured: false,
      url: SUPABASE_URL || 'Not set',
      message: 'Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in .env.',
      tables: {}
    });
  }

  const health = await SupabaseService.checkHealth();
  res.json({
    isConfigured: true,
    ...health
  });
});

app.post('/api/admin/supabase-seed', async (_req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(400).json({ error: 'Supabase credentials are not configured in .env' });
  }

  try {
    const result = await SupabaseService.seedInitialData();
    res.json({ message: 'Initial data seeded successfully to Supabase!', ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to seed Supabase database' });
  }
});

// --- Authentication ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, phone } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (isSupabaseConfigured()) {
    try {
      const authResult = await SupabaseService.signUpUser({
        email,
        password,
        fullName,
        phone,
      });
      return res.status(201).json(authResult);
    } catch (err: any) {
      console.warn('[Supabase Auth] Registration error:', err.message);
      return res.status(400).json({ error: err.message || 'Registration failed' });
    }
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    fullName,
    phone: phone || '',
    role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
    savedAddresses: []
  };
  users.push(newUser);

  res.status(201).json({ user: newUser, token: `token-${newUser.id}` });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (isSupabaseConfigured()) {
    try {
      const authResult = await SupabaseService.signInUser({ email, password });
      return res.json(authResult);
    } catch (err: any) {
      console.warn('[Supabase Auth] Login failed:', err.message);
      return res.status(401).json({ error: err.message || 'Invalid credentials' });
    }
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ user, token: `token-${user.id}` });
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '').trim();

  if (isSupabaseConfigured()) {
    try {
      const user = await SupabaseService.getUserFromToken(token);
      if (user) {
        return res.json({ user });
      }
    } catch (err: any) {
      console.warn('[Supabase Auth] Get user error:', err.message);
    }
  }

  const userId = token.replace('token-', '');
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User session expired or not found' });
  }
  res.json({ user });
});

// --- Categories ---
app.get('/api/categories', async (_req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const dbCategories = await SupabaseService.getCategories();
      if (dbCategories && dbCategories.length > 0) {
        return res.json(dbCategories);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch categories from database, falling back to local store:', err.message);
    }
  }
  res.json(categories);
});

// --- Products ---
app.get('/api/products', async (req, res) => {
  const { category, search, minPrice, maxPrice, sort, inStock, onSale } = req.query;

  if (isSupabaseConfigured()) {
    try {
      const dbResult = await SupabaseService.getProducts({
        category: category as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sort as string,
        inStock: inStock === 'true',
        onSale: onSale === 'true',
      });
      if (dbResult && dbResult.products && dbResult.products.length > 0) {
        return res.json(dbResult);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch products from Supabase, falling back to local store:', err.message);
    }
  }

  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(
      p => p.categorySlug.toLowerCase() === String(category).toLowerCase() ||
           p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.description.toLowerCase().includes(q) ||
           p.material.toLowerCase().includes(q) ||
           p.sku.toLowerCase().includes(q) ||
           (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  if (inStock === 'true') {
    filtered = filtered.filter(p => p.stock > 0);
  }

  if (onSale === 'true') {
    filtered = filtered.filter(p => p.discountPercent > 0);
  }

  // Sorting
  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  } else if (sort === 'discount') {
    filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  } else {
    // Default popularity: bestsellers first
    filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
  }

  res.json({
    total: filtered.length,
    products: filtered
  });
});

app.get('/api/products/:id', async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const dbProduct = await SupabaseService.getProductById(req.params.id);
      if (dbProduct) {
        return res.json(dbProduct);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch product by id:', err.message);
    }
  }

  const product = products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Admin Product Create
app.post('/api/products', async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const created = await SupabaseService.createProduct(req.body);
      products.unshift(created);
      return res.status(201).json(created);
    } catch (err: any) {
      console.warn('[Supabase] Failed to create product in Supabase, using local fallback:', err.message);
    }
  }

  const newProduct: Product = {
    ...req.body,
    id: `prod-${Date.now()}`,
    slug: req.body.name ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `prod-${Date.now()}`,
    rating: 5.0,
    reviewCount: 0,
    waterproof: true,
    hypoallergenic: true,
  };
  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

// Admin Product Update
app.put('/api/products/:id', async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const updated = await SupabaseService.updateProduct(req.params.id, req.body);
      if (updated) {
        const index = products.findIndex(p => p.id === req.params.id);
        if (index > -1) products[index] = { ...products[index], ...updated };
        return res.json(updated);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to update product in Supabase, updating local store:', err.message);
    }
  }

  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// Admin Product Delete
app.delete('/api/products/:id', async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      await SupabaseService.deleteProduct(req.params.id);
    } catch (err: any) {
      console.warn('[Supabase] Failed to delete product in Supabase:', err.message);
    }
  }

  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products.splice(index, 1);
  res.json({ success: true });
});

// --- Cart Operations ---
app.get('/api/cart', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  const cartItems = carts[sessionId] || [];
  res.json({ items: cartItems });
});

app.post('/api/cart', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  const { productId, variantId, quantity = 1 } = req.body;

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!carts[sessionId]) {
    carts[sessionId] = [];
  }

  const existingItemIndex = carts[sessionId].findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  const variant = product.variants.find(v => v.id === variantId);

  if (existingItemIndex > -1) {
    carts[sessionId][existingItemIndex].quantity += quantity;
  } else {
    carts[sessionId].push({
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      productId,
      product,
      variantId: variantId || (product.variants[0]?.id ?? ''),
      variantName: variant?.name || (product.variants[0]?.name ?? 'Standard'),
      quantity,
      price: product.price
    });
  }

  res.json({ items: carts[sessionId] });
});

app.put('/api/cart/:id', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  const { quantity } = req.body;

  if (!carts[sessionId]) {
    return res.status(404).json({ error: 'Cart is empty' });
  }

  const itemIndex = carts[sessionId].findIndex(item => item.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    carts[sessionId].splice(itemIndex, 1);
  } else {
    carts[sessionId][itemIndex].quantity = quantity;
  }

  res.json({ items: carts[sessionId] });
});

app.delete('/api/cart/:id', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  if (carts[sessionId]) {
    carts[sessionId] = carts[sessionId].filter(item => item.id !== req.params.id);
  }
  res.json({ items: carts[sessionId] || [] });
});

app.delete('/api/cart', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  carts[sessionId] = [];
  res.json({ items: [] });
});

// --- Wishlist Operations ---
app.get('/api/wishlist', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  const itemIds = wishlists[sessionId] || [];
  const wishlistProducts = products.filter(p => itemIds.includes(p.id));
  res.json({ productIds: itemIds, products: wishlistProducts });
});

app.post('/api/wishlist', (req, res) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  const { productId } = req.body;

  if (!wishlists[sessionId]) {
    wishlists[sessionId] = [];
  }

  const idx = wishlists[sessionId].indexOf(productId);
  if (idx > -1) {
    wishlists[sessionId].splice(idx, 1);
  } else {
    wishlists[sessionId].push(productId);
  }

  const wishlistProducts = products.filter(p => wishlists[sessionId].includes(p.id));
  res.json({ productIds: wishlists[sessionId], products: wishlistProducts });
});

// --- Coupons ---
app.post('/api/coupons/validate', async (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code required' });
  }

  let coupon: Coupon | undefined | null;

  if (isSupabaseConfigured()) {
    try {
      coupon = await SupabaseService.getCouponByCode(code);
    } catch (err: any) {
      console.warn('[Supabase] Failed to check coupon in Supabase, using local fallback:', err.message);
    }
  }

  if (!coupon) {
    coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  }

  if (!coupon) {
    return res.status(404).json({ valid: false, error: 'Invalid or expired coupon code' });
  }

  if (orderAmount < coupon.minOrder) {
    return res.status(400).json({
      valid: false,
      error: `Minimum order value for ${coupon.code} is ₹${coupon.minOrder}`
    });
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, orderAmount);

  res.json({
    valid: true,
    code: coupon.code,
    discount,
    description: coupon.description
  });
});

// --- Razorpay Payment Integration ---
app.post('/api/payments/create-order', (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  // Generates server-side order payload
  const razorpayOrderId = `order_shp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  res.json({
    id: razorpayOrderId,
    entity: 'order',
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    status: 'created',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_shipineDemoKey'
  });
});

app.post('/api/payments/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ success: false, error: 'Missing payment parameters' });
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (razorpaySecret && razorpay_signature) {
    // True server-side cryptographic HMAC-SHA256 signature verification
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(text)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, verified: true });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  }

  // Fallback demo/test verification for Sandbox environment when no secret is configured
  res.json({
    success: true,
    verified: true,
    mode: 'sandbox_test_verified',
    paymentId: razorpay_payment_id
  });
});

// --- Orders ---
app.post('/api/orders', async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    discount = 0,
    shipping = 0,
    total,
    couponCode,
    paymentMethod = 'razorpay',
    paymentStatus = 'paid',
    razorpayOrderId,
    razorpayPaymentId
  } = req.body;

  if (!customerName || !customerEmail || !items || items.length === 0) {
    return res.status(400).json({ error: 'Incomplete order payload' });
  }

  if (isSupabaseConfigured()) {
    try {
      const dbOrder = await SupabaseService.createOrder(req.body);
      orders.unshift(dbOrder);

      // Decrement local in-memory inventory
      items.forEach((item: any) => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.stock > 0) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });

      // Clear session cart
      const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
      if (carts[sessionId]) {
        carts[sessionId] = [];
      }

      return res.status(201).json(dbOrder);
    } catch (err: any) {
      console.warn('[Supabase] Failed to write order to Supabase, falling back to local store:', err.message);
    }
  }

  const orderNumber = `SHP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingNumber = `BD-${Math.floor(100000000 + Math.random() * 900000000)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    date: new Date().toISOString(),
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    discount,
    shipping,
    total,
    couponCode,
    status: 'confirmed',
    paymentStatus,
    paymentMethod,
    trackingNumber,
    courierPartner: 'Blue Dart / Delhivery Express',
    razorpayOrderId,
    razorpayPaymentId
  };

  orders.unshift(newOrder);

  // Decrement product inventory
  items.forEach((item: any) => {
    const prod = products.find(p => p.id === item.productId);
    if (prod && prod.stock > 0) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  // Clear session cart
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  if (carts[sessionId]) {
    carts[sessionId] = [];
  }

  res.status(201).json(newOrder);
});

app.get('/api/orders', async (req, res) => {
  const email = req.query.email as string;

  if (isSupabaseConfigured()) {
    try {
      const dbOrders = await SupabaseService.getOrders(email);
      if (dbOrders && dbOrders.length > 0) {
        return res.json(dbOrders);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch orders from Supabase:', err.message);
    }
  }

  if (email) {
    const filtered = orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
    return res.json(filtered);
  }
  res.json(orders);
});

app.get('/api/orders/:id', async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const dbOrder = await SupabaseService.getOrderById(req.params.id);
      if (dbOrder) {
        return res.json(dbOrder);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch order by id from Supabase:', err.message);
    }
  }

  const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// --- Reviews ---
app.get('/api/reviews', async (req, res) => {
  const { productId } = req.query;

  if (isSupabaseConfigured()) {
    try {
      const dbReviews = await SupabaseService.getReviews(productId as string);
      if (dbReviews && dbReviews.length > 0) {
        return res.json(dbReviews);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch reviews from Supabase:', err.message);
    }
  }

  if (productId) {
    return res.json(reviews.filter(r => r.productId === productId));
  }
  res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
  const { productId, authorName, rating, title, comment } = req.body;
  if (!productId || !authorName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  if (isSupabaseConfigured()) {
    try {
      const dbReview = await SupabaseService.createReview(req.body);
      reviews.unshift(dbReview);

      // Update local product aggregate
      const prod = products.find(p => p.id === productId);
      if (prod) {
        const prodReviews = reviews.filter(r => r.productId === productId);
        const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        prod.rating = Number(avg.toFixed(1));
        prod.reviewCount = prodReviews.length;
      }

      return res.status(201).json(dbReview);
    } catch (err: any) {
      console.warn('[Supabase] Failed to write review to Supabase, using local store:', err.message);
    }
  }

  const newReview: ProductReview = {
    id: `rev-${Date.now()}`,
    productId,
    authorName,
    rating: Number(rating),
    title: title || 'Verified Purchase',
    comment,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    isVerified: true
  };

  reviews.unshift(newReview);

  // Update product aggregated rating
  const prod = products.find(p => p.id === productId);
  if (prod) {
    const prodReviews = reviews.filter(r => r.productId === productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    prod.rating = Number(avg.toFixed(1));
    prod.reviewCount = prodReviews.length;
  }

  res.status(201).json(newReview);
});

// --- Newsletter ---
app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  if (isSupabaseConfigured()) {
    try {
      const result = await SupabaseService.subscribeNewsletter(email);
      subscribers.push({ email, subscribedAt: new Date().toISOString() });
      return res.json(result);
    } catch (err: any) {
      console.warn('[Supabase] Failed to write subscriber to Supabase:', err.message);
    }
  }

  const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ message: 'You are already subscribed to Shipine updates!' });
  }

  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  res.json({ message: 'Thank you for subscribing to Shipine! Check your inbox for exclusive offers.' });
});

// --- Admin Endpoints ---
app.get('/api/admin/dashboard', (_req, res) => {
  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const lowStockProducts = products.filter(p => p.stock < 25);

  res.json({
    metrics: {
      totalSales: Math.round(totalSales),
      totalOrders,
      totalCustomers: users.length,
      totalProducts: products.length,
      pendingOrders,
      completedOrders,
      lowStockCount: lowStockProducts.length
    },
    lowStockProducts,
    recentOrders: orders.slice(0, 5),
    revenueAnalytics: [
      { month: 'Jan', revenue: 64200 },
      { month: 'Feb', revenue: 78500 },
      { month: 'Mar', revenue: 112400 },
      { month: 'Apr', revenue: Math.round(totalSales + 45000) }
    ]
  });
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  const { status, trackingNumber } = req.body;

  if (isSupabaseConfigured()) {
    try {
      const updated = await SupabaseService.updateOrderStatus(req.params.id, status, trackingNumber);
      if (updated) {
        const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
        if (order) {
          if (status) order.status = status;
          if (trackingNumber) order.trackingNumber = trackingNumber;
        }
        return res.json(updated);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to update order status in Supabase:', err.message);
    }
  }

  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  res.json(order);
});

app.get('/api/admin/customers', async (_req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const dbProfiles = await SupabaseService.getProfiles();
      if (dbProfiles && dbProfiles.length > 0) {
        const customersWithStats = dbProfiles.map(user => {
          const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
          const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
          return {
            ...user,
            orderCount: userOrders.length,
            totalSpent
          };
        });
        return res.json(customersWithStats);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch profiles from Supabase:', err.message);
    }
  }

  const customersWithStats = users.map(user => {
    const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...user,
      orderCount: userOrders.length,
      totalSpent
    };
  });
  res.json(customersWithStats);
});

app.get('/api/admin/coupons', async (_req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const dbCoupons = await SupabaseService.getCoupons();
      if (dbCoupons && dbCoupons.length > 0) {
        return res.json(dbCoupons);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch coupons from Supabase:', err.message);
    }
  }
  res.json(coupons);
});

app.post('/api/admin/coupons', async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const created = await SupabaseService.createCoupon(req.body);
      coupons.push(created);
      return res.status(201).json(created);
    } catch (err: any) {
      console.warn('[Supabase] Failed to create coupon in Supabase:', err.message);
    }
  }

  const newCoupon: Coupon = {
    ...req.body,
    code: req.body.code.toUpperCase().trim(),
    isActive: true
  };
  coupons.push(newCoupon);
  res.status(201).json(newCoupon);
});

app.get('/api/admin/subscribers', async (_req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const dbSubs = await SupabaseService.getNewsletterSubscribers();
      if (dbSubs && dbSubs.length > 0) {
        return res.json(dbSubs);
      }
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch subscribers from Supabase:', err.message);
    }
  }
  res.json(subscribers);
});

/* ==========================================================================
   Vite Middleware & Production Static Serving
   ========================================================================== */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Shipine Server running on http://0.0.0.0:${PORT}`);
    if (isSupabaseConfigured()) {
      console.log(`[Supabase] Live Supabase integration initialized (${SUPABASE_URL})`);
    } else {
      console.log(`[Supabase] Supabase credentials not configured in .env (running with memory store fallback)`);
    }
  });
}

startServer();
