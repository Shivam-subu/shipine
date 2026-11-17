import { getSupabaseBackendClient, isSupabaseConfigured, SUPABASE_URL, supabase, supabaseAdmin } from '../lib/supabase.ts';
import { Product, ProductCategory, Coupon, ProductReview, Order, UserProfile } from '../types/index.ts';
import { INITIAL_PRODUCTS, CATEGORIES, INITIAL_COUPONS } from '../data/products.ts';

// Helper to check if client is ready
function getClient() {
  const client = getSupabaseBackendClient();
  if (!client) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY.');
  }
  return client;
}

/* ==========================================================================
   MAPPERS (PostgreSQL snake_case <-> TypeScript camelCase)
   ========================================================================== */

function mapCategoryFromDB(row: any): ProductCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    imageUrl: row.image_url || '',
    count: row.count || undefined,
  };
}

function mapProductFromDB(row: any, categoryMap: Map<string, { name: string; slug: string }>): Product {
  const cat = row.category_id ? categoryMap.get(row.category_id) : null;
  const images = (row.product_images || [])
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img: any) => img.image_url);

  const variants = (row.product_variants || []).map((v: any) => ({
    id: v.id,
    name: v.name,
    colorName: v.color_name || '',
    colorHex: v.color_hex || '#000000',
    sku: v.sku || '',
    stock: v.stock ?? 20,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    category: cat?.name || row.category_name || 'Jewellery',
    categorySlug: cat?.slug || row.category_slug || 'all',
    price: Number(row.price_inr),
    originalPrice: Number(row.original_price_inr || row.price_inr),
    discountPercent: Number(row.discount_percent || 0),
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.rating_count || 0),
    description: row.description || row.short_description || '',
    material: row.material || '316L Stainless Steel with 18K Gold PVD Coating',
    dimensions: row.dimensions || '',
    weightGrams: row.weight_grams ? Number(row.weight_grams) : undefined,
    stock: Number(row.stock ?? 50),
    images: images.length > 0 ? images : ['/src/assets/images/cat_earrings_showcase_1794034445053.jpg'],
    variants: variants.length > 0 ? variants : [
      { id: `${row.id}-v1`, name: '18K Yellow Gold', colorName: 'Yellow Gold', colorHex: '#E5C07B', sku: `${row.sku}-YG`, stock: row.stock ?? 20 }
    ],
    careInstructions: row.care_instructions || 'Wipe clean with a soft dry cloth. Store in your Shipine pouch when not in use.',
    isBestseller: !!row.is_bestseller,
    isNewArrival: !!row.is_new_arrival,
    isFeatured: !!row.is_featured,
    waterproof: row.waterproof !== false,
    hypoallergenic: row.hypoallergenic !== false,
  };
}

function mapOrderFromDB(row: any): Order {
  const items = (row.order_items || []).map((item: any) => ({
    productId: item.product_id,
    productName: item.product_name,
    variantName: item.variant_name || '',
    sku: item.sku || '',
    price: Number(item.unit_price_inr),
    quantity: Number(item.quantity),
    imageUrl: item.image_url || '',
  }));

  return {
    id: row.id,
    orderNumber: row.order_number,
    date: row.created_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone || '',
    shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
    items,
    subtotal: Number(row.subtotal_inr),
    discount: Number(row.discount_inr || 0),
    shipping: Number(row.shipping_inr || 0),
    total: Number(row.total_inr),
    couponCode: row.coupon_code || undefined,
    status: row.order_status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    trackingNumber: row.tracking_number || '',
    courierPartner: row.courier_partner || 'Blue Dart / Delhivery Express',
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
  };
}

function mapCouponFromDB(row: any): Coupon {
  return {
    code: row.code,
    type: row.discount_type === 'percentage' ? 'percentage' : 'fixed',
    value: Number(row.discount_value),
    minOrder: Number(row.min_order_inr || 0),
    maxDiscount: row.max_discount_inr ? Number(row.max_discount_inr) : undefined,
    description: row.description || '',
    isActive: row.is_active !== false,
  };
}

function mapReviewFromDB(row: any): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    rating: Number(row.rating),
    title: row.title || 'Verified Purchase',
    comment: row.comment,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent',
    isVerified: row.is_verified_buyer !== false,
  };
}

/* ==========================================================================
   DATABASE SERVICES
   ========================================================================== */

export const SupabaseService = {
  /**
   * Check connection status and tables existence
   */
  async checkHealth(): Promise<{ ok: boolean; projectUrl: string; message: string; tables: Record<string, boolean> }> {
    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        projectUrl: SUPABASE_URL || 'Not configured',
        message: 'Supabase credentials are missing or set to placeholder values in .env',
        tables: {},
      };
    }

    try {
      const client = getClient();
      const tablesToCheck = ['product_categories', 'products', 'orders', 'coupons', 'reviews', 'profiles', 'newsletter_subscribers'];
      const tableStatus: Record<string, boolean> = {};

      for (const table of tablesToCheck) {
        const { error } = await client.from(table).select('*').limit(1);
        tableStatus[table] = !error;
      }

      const allAvailable = Object.values(tableStatus).every(Boolean);
      const anyAvailable = Object.values(tableStatus).some(Boolean);

      let message = 'Connected to Supabase PostgreSQL database';
      if (!anyAvailable) {
        message = 'Connected to Supabase, but database tables are not visible yet. Please execute /database/migrations/01_init.sql in the Supabase SQL Editor.';
      } else if (!allAvailable) {
        message = 'Some tables are missing. Please run /database/migrations/01_init.sql in the Supabase SQL Editor.';
      }

      return {
        ok: anyAvailable,
        projectUrl: SUPABASE_URL,
        message,
        tables: tableStatus,
      };
    } catch (err: any) {
      return {
        ok: false,
        projectUrl: SUPABASE_URL,
        message: err.message || 'Failed to connect to Supabase',
        tables: {},
      };
    }
  },

  // --- Categories ---
  async getCategories(): Promise<ProductCategory[]> {
    const client = getClient();
    const { data, error } = await client
      .from('product_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapCategoryFromDB);
  },

  // --- Products ---
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    inStock?: boolean;
    onSale?: boolean;
  }): Promise<{ products: Product[]; total: number }> {
    const client = getClient();

    // 1. Fetch categories for slug/name mapping
    const { data: categoriesData } = await client.from('product_categories').select('id, name, slug');
    const categoryMap = new Map<string, { name: string; slug: string }>();
    (categoriesData || []).forEach((c: any) => categoryMap.set(c.id, { name: c.name, slug: c.slug }));

    // 2. Build product query
    let query = client
      .from('products')
      .select('*, product_images(*), product_variants(*)')
      .eq('status', 'active');

    if (params?.category && params.category !== 'all') {
      // Find category id by slug or name
      const matchedCat = (categoriesData || []).find(
        (c: any) => c.slug.toLowerCase() === params.category!.toLowerCase() || c.name.toLowerCase() === params.category!.toLowerCase()
      );
      if (matchedCat) {
        query = query.eq('category_id', matchedCat.id);
      }
    }

    if (params?.search) {
      const q = `%${params.search}%`;
      query = query.or(`name.ilike.${q},description.ilike.${q},material.ilike.${q},sku.ilike.${q}`);
    }

    if (params?.minPrice !== undefined && !isNaN(params.minPrice)) {
      query = query.gte('price_inr', params.minPrice);
    }

    if (params?.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      query = query.lte('price_inr', params.maxPrice);
    }

    if (params?.inStock) {
      query = query.gt('stock', 0);
    }

    if (params?.onSale) {
      query = query.gt('discount_percent', 0);
    }

    // Sorting
    if (params?.sort === 'price-low') {
      query = query.order('price_inr', { ascending: true });
    } else if (params?.sort === 'price-high') {
      query = query.order('price_inr', { ascending: false });
    } else if (params?.sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (params?.sort === 'newest') {
      query = query.order('is_new_arrival', { ascending: false }).order('created_at', { ascending: false });
    } else if (params?.sort === 'discount') {
      query = query.order('discount_percent', { ascending: false });
    } else {
      // Default: bestsellers first
      query = query.order('is_bestseller', { ascending: false }).order('rating', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    const products = (data || []).map((row: any) => mapProductFromDB(row, categoryMap));
    return {
      products,
      total: products.length,
    };
  },

  async getProductById(idOrSlug: string): Promise<Product | null> {
    const client = getClient();
    const { data: categoriesData } = await client.from('product_categories').select('id, name, slug');
    const categoryMap = new Map<string, { name: string; slug: string }>();
    (categoriesData || []).forEach((c: any) => categoryMap.set(c.id, { name: c.name, slug: c.slug }));

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = client
      .from('products')
      .select('*, product_images(*), product_variants(*)')
      .limit(1);

    if (isUUID) {
      query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return mapProductFromDB(data[0], categoryMap);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const client = getClient();

    // Look up category id
    let categoryId: string | null = null;
    if (productData.categorySlug || productData.category) {
      const { data: cat } = await client
        .from('product_categories')
        .select('id')
        .or(`slug.eq.${productData.categorySlug || ''},name.eq.${productData.category || ''}`)
        .limit(1)
        .maybeSingle();
      if (cat) categoryId = cat.id;
    }

    const slug = productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `prod-${Date.now()}`);

    const insertPayload: any = {
      name: productData.name || 'New Piece',
      slug,
      sku: productData.sku || `SHP-${Date.now().toString(36).toUpperCase()}`,
      category_id: categoryId,
      description: productData.description || '',
      short_description: productData.description?.slice(0, 150) || '',
      material: productData.material || '316L Stainless Steel with 18K Gold PVD Coating',
      dimensions: productData.dimensions || '',
      weight_grams: productData.weightGrams || 15,
      waterproof: productData.waterproof !== false,
      hypoallergenic: productData.hypoallergenic !== false,
      price_inr: productData.price || 1299,
      original_price_inr: productData.originalPrice || productData.price || 1299,
      discount_percent: productData.discountPercent || 0,
      stock: productData.stock ?? 50,
      status: 'active',
      rating: 5.0,
      rating_count: 0,
      care_instructions: productData.careInstructions || 'Wipe clean with a soft dry cloth.',
      is_bestseller: !!productData.isBestseller,
      is_new_arrival: !!productData.isNewArrival,
      is_featured: !!productData.isFeatured,
    };

    const { data: insertedProduct, error: prodError } = await client
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (prodError) throw prodError;

    // Insert images if provided
    if (productData.images && productData.images.length > 0) {
      const imagePayloads = productData.images.map((url, idx) => ({
        product_id: insertedProduct.id,
        image_url: url,
        display_order: idx + 1,
        is_primary: idx === 0,
      }));
      await client.from('product_images').insert(imagePayloads);
    }

    // Insert variants if provided
    if (productData.variants && productData.variants.length > 0) {
      const variantPayloads = productData.variants.map(v => ({
        product_id: insertedProduct.id,
        name: v.name,
        color_name: v.colorName,
        color_hex: v.colorHex,
        sku: v.sku || `${insertedProduct.sku}-VAR`,
        stock: v.stock ?? 20,
      }));
      await client.from('product_variants').insert(variantPayloads);
    }

    return (await this.getProductById(insertedProduct.id))!;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const client = getClient();
    const updatePayload: any = { updated_at: new Date().toISOString() };

    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.price !== undefined) updatePayload.price_inr = updates.price;
    if (updates.originalPrice !== undefined) updatePayload.original_price_inr = updates.originalPrice;
    if (updates.discountPercent !== undefined) updatePayload.discount_percent = updates.discountPercent;
    if (updates.stock !== undefined) updatePayload.stock = updates.stock;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.material !== undefined) updatePayload.material = updates.material;
    if (updates.dimensions !== undefined) updatePayload.dimensions = updates.dimensions;
    if (updates.careInstructions !== undefined) updatePayload.care_instructions = updates.careInstructions;
    if (updates.isBestseller !== undefined) updatePayload.is_bestseller = updates.isBestseller;
    if (updates.isNewArrival !== undefined) updatePayload.is_new_arrival = updates.isNewArrival;
    if (updates.isFeatured !== undefined) updatePayload.is_featured = updates.isFeatured;

    const { error } = await client.from('products').update(updatePayload).eq('id', id);
    if (error) throw error;

    return await this.getProductById(id);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const client = getClient();
    // Soft delete or hard delete
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- Orders ---
  async getOrders(customerEmail?: string): Promise<Order[]> {
    const client = getClient();
    let query = client
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (customerEmail) {
      query = query.ilike('customer_email', customerEmail);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapOrderFromDB);
  },

  async getOrderById(idOrOrderNumber: string): Promise<Order | null> {
    const client = getClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrOrderNumber);

    let query = client
      .from('orders')
      .select('*, order_items(*)')
      .limit(1);

    if (isUUID) {
      query = query.or(`id.eq.${idOrOrderNumber},order_number.eq.${idOrOrderNumber}`);
    } else {
      query = query.eq('order_number', idOrOrderNumber);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return mapOrderFromDB(data[0]);
  },

  async createOrder(orderData: any): Promise<Order> {
    const client = getClient();

    const orderNumber = orderData.orderNumber || `SHP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = orderData.trackingNumber || `BD-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const orderPayload = {
      order_number: orderNumber,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone || '',
      subtotal_inr: orderData.subtotal,
      discount_inr: orderData.discount || 0,
      shipping_inr: orderData.shipping || 0,
      total_inr: orderData.total,
      coupon_code: orderData.couponCode || null,
      order_status: orderData.status || 'confirmed',
      payment_status: orderData.paymentStatus || 'paid',
      payment_method: orderData.paymentMethod || 'razorpay',
      tracking_number: trackingNumber,
      courier_partner: orderData.courierPartner || 'Blue Dart / Delhivery Express',
      shipping_address: orderData.shippingAddress,
    };

    const { data: insertedOrder, error: orderError } = await client
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const itemsPayload = orderData.items.map((item: any) => ({
        order_id: insertedOrder.id,
        product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId) ? item.productId : null,
        product_name: item.productName,
        variant_name: item.variantName || 'Standard',
        sku: item.sku || '',
        image_url: item.imageUrl || '',
        unit_price_inr: item.price,
        quantity: item.quantity,
        total_price_inr: item.price * item.quantity,
      }));

      await client.from('order_items').insert(itemsPayload);
    }

    return (await this.getOrderById(insertedOrder.id))!;
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order | null> {
    const client = getClient();
    const updatePayload: any = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };
    if (trackingNumber) {
      updatePayload.tracking_number = trackingNumber;
    }

    const { error } = await client.from('orders').update(updatePayload).eq('id', id);
    if (error) throw error;

    return await this.getOrderById(id);
  },

  // --- Coupons ---
  async getCoupons(): Promise<Coupon[]> {
    const client = getClient();
    const { data, error } = await client.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCouponFromDB);
  },

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const client = getClient();
    const { data, error } = await client
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapCouponFromDB(data);
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const client = getClient();
    const payload = {
      code: coupon.code?.toUpperCase().trim(),
      discount_type: coupon.type === 'fixed' ? 'fixed_amount' : 'percentage',
      discount_value: coupon.value,
      min_order_inr: coupon.minOrder || 0,
      max_discount_inr: coupon.maxDiscount || null,
      description: coupon.description || '',
      is_active: coupon.isActive !== false,
    };

    const { data, error } = await client.from('coupons').insert(payload).select().single();
    if (error) throw error;
    return mapCouponFromDB(data);
  },

  // --- Reviews ---
  async getReviews(productId?: string): Promise<ProductReview[]> {
    const client = getClient();
    let query = client.from('reviews').select('*').order('created_at', { ascending: false });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapReviewFromDB);
  },

  async createReview(review: Partial<ProductReview>): Promise<ProductReview> {
    const client = getClient();
    const payload = {
      product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(review.productId || '') ? review.productId : null,
      author_name: review.authorName || 'Verified Buyer',
      rating: Number(review.rating || 5),
      title: review.title || 'Verified Purchase',
      comment: review.comment || '',
      is_verified_buyer: true,
    };

    const { data, error } = await client.from('reviews').insert(payload).select().single();
    if (error) throw error;
    return mapReviewFromDB(data);
  },

  // --- Newsletter ---
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const client = getClient();
    const { error } = await client
      .from('newsletter_subscribers')
      .upsert({ email: email.toLowerCase().trim(), status: 'active', source: 'footer' }, { onConflict: 'email' });

    if (error) throw error;
    return { success: true, message: 'Thank you for subscribing to Shipine updates!' };
  },

  async getNewsletterSubscribers(): Promise<Array<{ email: string; subscribedAt: string }>> {
    const client = getClient();
    const { data, error } = await client.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      email: row.email,
      subscribedAt: row.created_at,
    }));
  },

  // --- Users / Profiles ---
  async getProfiles(): Promise<UserProfile[]> {
    const client = getClient();
    const { data, error } = await client.from('profiles').select('*, addresses(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name || '',
      phone: row.phone || '',
      role: row.role || 'customer',
      savedAddresses: (row.addresses || []).map((addr: any) => ({
        fullName: addr.full_name,
        email: row.email,
        phone: addr.phone,
        houseFlat: addr.house_flat,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
      })),
    }));
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const client = getClient();
    const { data, error } = await client.from('profiles').select('*, addresses(*)').ilike('email', email.trim()).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || '',
      phone: data.phone || '',
      role: data.role || 'customer',
      savedAddresses: (data.addresses || []).map((addr: any) => ({
        fullName: addr.full_name,
        email: data.email,
        phone: addr.phone,
        houseFlat: addr.house_flat,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
      })),
    };
  },

  async createProfile(user: { id?: string; email: string; fullName: string; phone?: string; role?: 'customer' | 'admin' }): Promise<UserProfile> {
    const client = supabaseAdmin || getClient();
    const payload: any = {
      email: user.email.toLowerCase().trim(),
      full_name: user.fullName,
      phone: user.phone || '',
      role: user.role || 'customer',
      updated_at: new Date().toISOString(),
    };
    if (user.id) payload.id = user.id;

    const { data, error } = await client.from('profiles').upsert(payload, { onConflict: 'email' }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      role: data.role,
      savedAddresses: [],
    };
  },

  // --- Real Supabase Auth Integration ---
  async signUpUser(payload: { email: string; password: string; fullName: string; phone?: string; role?: 'customer' | 'admin' }): Promise<{ user: UserProfile; token: string }> {
    const adminClient = supabaseAdmin || getClient();
    const publicClient = supabase || getClient();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const role = payload.role || (normalizedEmail.includes('admin') ? 'admin' : 'customer');

    // 1. Create user in Supabase Auth with auto-confirmation
    let authUserId: string;
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
        phone: payload.phone || '',
        role,
      },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes('already') || (createError as any).status === 422) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      throw createError;
    }

    authUserId = newUser.user.id;

    // 2. Upsert profile in public.profiles table
    const { data: profile, error: profError } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: authUserId,
          email: normalizedEmail,
          full_name: payload.fullName,
          phone: payload.phone || '',
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select('*, addresses(*)')
      .single();

    if (profError) throw profError;

    // 3. Sign in to obtain session token
    let token = `token-${authUserId}`;
    try {
      const { data: signInData } = await publicClient.auth.signInWithPassword({
        email: normalizedEmail,
        password: payload.password,
      });
      if (signInData?.session?.access_token) {
        token = signInData.session.access_token;
      }
    } catch {
      // Keep token fallback
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || payload.fullName,
      phone: profile.phone || payload.phone || '',
      role: profile.role || role,
      savedAddresses: (profile.addresses || []).map((addr: any) => ({
        fullName: addr.full_name,
        email: profile.email,
        phone: addr.phone,
        houseFlat: addr.house_flat,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
      })),
    };

    return { user: userProfile, token };
  },

  async signInUser(credentials: { email: string; password: string }): Promise<{ user: UserProfile; token: string }> {
    const publicClient = supabase || getClient();
    const adminClient = supabaseAdmin || getClient();
    const normalizedEmail = credentials.email.toLowerCase().trim();

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await publicClient.auth.signInWithPassword({
      email: normalizedEmail,
      password: credentials.password,
    });

    if (authError) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const authUser = authData.user;
    if (!authUser) {
      throw new Error('User authentication failed.');
    }

    // Retrieve or create profile from public.profiles
    let { data: profile, error: profError } = await adminClient
      .from('profiles')
      .select('*, addresses(*)')
      .or(`id.eq.${authUser.id},email.eq.${normalizedEmail}`)
      .maybeSingle();

    if (!profile) {
      const defaultRole = normalizedEmail.includes('admin') ? 'admin' : 'customer';
      const meta = authUser.user_metadata || {};
      const { data: createdProfile, error: createProfError } = await adminClient
        .from('profiles')
        .insert({
          id: authUser.id,
          email: normalizedEmail,
          full_name: meta.full_name || normalizedEmail.split('@')[0],
          phone: meta.phone || '',
          role: meta.role || defaultRole,
        })
        .select('*, addresses(*)')
        .single();

      if (createProfError) throw createProfError;
      profile = createdProfile;
    }

    const token = authData.session?.access_token || `token-${profile.id}`;

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || '',
      phone: profile.phone || '',
      role: profile.role || 'customer',
      savedAddresses: (profile.addresses || []).map((addr: any) => ({
        fullName: addr.full_name,
        email: profile.email,
        phone: addr.phone,
        houseFlat: addr.house_flat,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
      })),
    };

    return { user: userProfile, token };
  },

  async getUserFromToken(token: string): Promise<UserProfile | null> {
    const publicClient = supabase || getClient();
    const adminClient = supabaseAdmin || getClient();

    try {
      const { data, error } = await publicClient.auth.getUser(token);
      if (error || !data?.user) return null;

      const authUser = data.user;
      const { data: profile } = await adminClient
        .from('profiles')
        .select('*, addresses(*)')
        .or(`id.eq.${authUser.id},email.eq.${authUser.email}`)
        .maybeSingle();

      if (!profile) return null;

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        role: profile.role || 'customer',
        savedAddresses: (profile.addresses || []).map((addr: any) => ({
          fullName: addr.full_name,
          email: profile.email,
          phone: addr.phone,
          houseFlat: addr.house_flat,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country || 'India',
        })),
      };
    } catch {
      return null;
    }
  },

  // --- Seed Initial Data to Supabase ---
  async seedInitialData(): Promise<{ success: boolean; seeded: { categories: number; products: number; coupons: number } }> {
    const client = getClient();

    // Verify tables exist in Supabase before attempting to insert
    const { error: verifyError } = await client.from('product_categories').select('id').limit(1);
    if (verifyError) {
      if (verifyError.code === 'PGRST205') {
        throw new Error(
          'Tables not found in Supabase! You must execute the SQL in database/migrations/01_init.sql in the Supabase SQL Editor first to create the tables.'
        );
      }
      throw new Error(`Supabase query error: ${verifyError.message}`);
    }

    // 1. Seed Categories
    for (const cat of CATEGORIES) {
      const { error: catErr } = await client.from('product_categories').upsert(
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image_url: cat.imageUrl,
          display_order: cat.id === 'cat-earrings' ? 1 : cat.id === 'cat-necklaces' ? 2 : cat.id === 'cat-bracelets' ? 3 : cat.id === 'cat-rings' ? 4 : 5,
        },
        { onConflict: 'slug' }
      );
      if (catErr) {
        throw new Error(`Failed to seed category "${cat.name}": ${catErr.message}`);
      }
    }

    // 2. Fetch seeded categories to get their UUIDs
    const { data: catRows, error: catFetchErr } = await client.from('product_categories').select('id, slug');
    if (catFetchErr || !catRows || catRows.length === 0) {
      throw new Error('Failed to retrieve categories after inserting.');
    }
    const catMap = new Map((catRows || []).map((r: any) => [r.slug, r.id]));

    // 3. Seed Products
    let productCount = 0;
    for (const prod of INITIAL_PRODUCTS) {
      const catId = catMap.get(prod.categorySlug);
      const { data: inserted, error: prodErr } = await client
        .from('products')
        .upsert(
          {
            name: prod.name,
            slug: prod.slug,
            sku: prod.sku,
            category_id: catId || null,
            short_description: prod.description.slice(0, 150),
            description: prod.description,
            material: prod.material,
            dimensions: prod.dimensions,
            weight_grams: prod.weightGrams || 15,
            waterproof: prod.waterproof,
            hypoallergenic: prod.hypoallergenic,
            price_inr: prod.price,
            original_price_inr: prod.originalPrice,
            discount_percent: prod.discountPercent,
            stock: prod.stock,
            is_bestseller: !!prod.isBestseller,
            is_new_arrival: !!prod.isNewArrival,
            is_featured: !!prod.isFeatured,
            care_instructions: prod.careInstructions,
          },
          { onConflict: 'slug' }
        )
        .select()
        .single();

      if (prodErr) {
        console.warn(`[Supabase Seed] Error upserting product ${prod.name}:`, prodErr.message);
        continue;
      }

      if (inserted) {
        productCount++;
        // Seed primary image
        if (prod.images && prod.images.length > 0) {
          await client.from('product_images').insert(
            prod.images.map((img, i) => ({
              product_id: inserted.id,
              image_url: img,
              display_order: i + 1,
              is_primary: i === 0,
            }))
          );
        }

        // Seed variants
        if (prod.variants && prod.variants.length > 0) {
          await client.from('product_variants').insert(
            prod.variants.map(v => ({
              product_id: inserted.id,
              name: v.name,
              color_name: v.colorName,
              color_hex: v.colorHex,
              sku: v.sku,
              stock: v.stock,
            }))
          );
        }
      }
    }

    // 4. Seed Coupons
    let couponCount = 0;
    for (const c of INITIAL_COUPONS) {
      const { error: coupErr } = await client.from('coupons').upsert(
        {
          code: c.code,
          discount_type: c.type === 'percentage' ? 'percentage' : 'fixed_amount',
          discount_value: c.value,
          min_order_inr: c.minOrder,
          max_discount_inr: c.maxDiscount || null,
          description: c.description,
          is_active: c.isActive,
        },
        { onConflict: 'code' }
      );
      if (!coupErr) couponCount++;
    }

    return {
      success: true,
      seeded: {
        categories: CATEGORIES.length,
        products: productCount,
        coupons: couponCount,
      },
    };
  },
};
