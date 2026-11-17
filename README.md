# SHIPINE – Premium Anti-Tarnish Jewellery E-Commerce Platform

A production-ready, full-stack e-commerce web application for **SHIPINE**, a modern women's fashion jewellery brand specializing in anti-tarnish, waterproof, and hypoallergenic pieces.

## Brand Identity & Aesthetic
- **Brand Name**: Shipine
- **Tagline**: *Jewellery That Stays Beautiful.*
- **Colour Palette**:
  - Warm Ivory (`#FAF8F4`)
  - Champagne Beige (`#E8DDCB`)
  - Soft Gold Accent (`#C5A46D`)
  - Deep Charcoal (`#242424`)
  - Muted Gray (`#777777`)
- **Typography**:
  - Headings: Playfair Display / Cormorant Garamond
  - Body: Plus Jakarta Sans / Inter

---

## Key Features & Capabilities

### 1. Storefront Experience
- **Announcement Bar**: Free Shipping above ₹999 & Anti-Tarnish Guarantee.
- **Top Bar Contract**: Sticky, 1-line brand mark, category navigation, search modal, wishlist indicator, and shopping bag drawer.
- **Hero Campaign**: High-resolution editorial model visuals, value propositions, and direct collection triggers.
- **Shop By Category**: Interactive category cards for Earrings, Necklaces, Bracelets, Rings, and Sets.
- **Best Sellers & New Arrivals**: 20 real jewellery pieces with INR pricing, discounts, star ratings, and instant bag additions.
- **Verified Brand Benefits**: 18K vacuum gold PVD finish, hypoallergenic surgical steel, shower/pool waterproof endurance, and insured express delivery.
- **Editorial Campaign Banner**: *"Little Details. Endless Elegance."*
- **Customer Reviews**: Verified customer feedback with product references and interactive review submission.
- **Instagram Styling Gallery**: Community photography grid showcasing real styling moments.
- **Newsletter Subscription**: Direct subscription hooked to `/api/newsletter/subscribe`.

### 2. Shopping Experience & Product Detail (PDP)
- Full product filtering by category, price slider (₹800 - ₹4,000), stock availability, and promotional sales.
- Product sorting by Popularity, Price (Low to High / High to Low), Newest Arrivals, and Discount %.
- High-resolution gallery with thumbnail switcher and click-to-zoom mode.
- PVD technology breakdown and anti-tarnish care instructions.
- Live Indian delivery PIN code checker with ETA calculation across metros and non-metros.
- "Frequently Bought Together" bundle with 1-click bundle discount.

### 3. Cart & Multi-Step Checkout
- Slide-over bag drawer with free shipping progress bar ("Add ₹X more for Free Delivery").
- Real-time coupon validator (`FIRST10`, `ELEGANCE20`, `GOLD500`).
- Step 1: Customer Contact (Name, Email, Mobile).
- Step 2: Indian Shipping Address with PIN code verification.
- Step 3: Razorpay payment gateway simulation & server-side HMAC-SHA256 signature verification (UPI, Cards, Net Banking, COD).
- Step 4: Instant order confirmation receipt, order number (e.g., `SHP-2026-8941`), courier AWB tracking, and downloadable tax invoice.

### 4. Customer Portal
- Order history with live 4-stage tracking timeline (Confirmed $\to$ Packed $\to$ Dispatched $\to$ Delivered).
- Saved wishlist with 1-click move to bag.
- Saved address management and customer profile.

### 5. Protected Admin Dashboard
- Real-time sales, order volume, customer counts, and low-stock alerts.
- Product Manager: Add, edit prices/stock/descriptions, and remove products.
- Order Management: View order details, change statuses, and update courier tracking numbers.
- Coupon & Marketing Manager: Create promo codes with percentage or flat discounts.

---

## Database Architecture (PostgreSQL / Supabase)
Full SQL migration files located in `/database/migrations`:
- `01_init.sql`: Creates 20 tables with primary/foreign keys, indexes, triggers, and Row Level Security (RLS) policies.
- `02_seed.sql`: Seeds initial categories and promotional coupons.

---

## API Endpoints
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Products**: `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- **Cart**: `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:id`, `DELETE /api/cart/:id`
- **Coupons**: `POST /api/coupons/validate`
- **Payments**: `POST /api/payments/create-order`, `POST /api/payments/verify`
- **Orders**: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`
- **Reviews**: `GET /api/reviews`, `POST /api/reviews`
- **Newsletter**: `POST /api/newsletter/subscribe`
- **Admin**: `GET /api/admin/dashboard`, `PUT /api/admin/orders/:id/status`, `GET /api/admin/customers`, `GET /api/admin/coupons`
