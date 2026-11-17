-- SHIPINE Initial Seed Data Migration
-- Inserts the 5 categories, sample products, initial coupons, and sample reviews

-- 1. Insert Categories
INSERT INTO public.product_categories (name, slug, description, image_url, display_order)
VALUES 
  ('Earrings', 'earrings', 'Anti-tarnish hoops, studs & statement drops crafted for all-day comfort.', '/src/assets/images/cat_earrings_showcase_1794034445053.jpg', 1),
  ('Necklaces', 'necklaces', 'Delicate chains, celestial pendants & waterproof layering statements.', '/src/assets/images/cat_necklaces_showcase_1794034445747.jpg', 2),
  ('Bracelets', 'bracelets', 'Timeless cuffs, clover links & tennis bracelets with 18K gold PVD finish.', '/src/assets/images/cat_bracelets_showcase_1794034446075.jpg', 3),
  ('Rings', 'rings', 'Stackable bands and signet rings engineered to never green your fingers.', '/src/assets/images/campaign_editorial_banner_1794034446542.jpg', 4),
  ('Jewellery Sets', 'jewellery-sets', 'Curated sets for gifting and special celebrations in signature packaging.', '/src/assets/images/hero_jewellery_model_1794034444574.jpg', 5)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_inr, max_discount_inr, description, is_active)
VALUES
  ('FIRST10', 'percentage', 10, 799, 500, '10% OFF on your first purchase above ₹799', true),
  ('ELEGANCE20', 'percentage', 20, 1999, 1000, '20% OFF on premium jewellery orders above ₹1,999', true),
  ('GOLD500', 'fixed_amount', 500, 2999, NULL, 'Flat ₹500 OFF on orders above ₹2,999', true)
ON CONFLICT (code) DO NOTHING;
