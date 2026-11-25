import React, { useState } from 'react';
import { ResponsiveImage } from '../components/ResponsiveImage.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import {
  Star,
  ShieldCheck,
  Droplets,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Plus,
  Minus,
  MapPin,
  Share2
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
    deliveryPincode,
    deliveryEstimate,
    checkPincodeDelivery,
    showNotification
  } = useStore();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [pinInput, setPinInput] = useState(deliveryPincode);
  const [isZoomed, setIsZoomed] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const activeVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];

  // Frequently bought together bundle (the next product in catalog)
  const bundleProduct = products.find(p => p.id !== product.id && p.category !== product.category) || products[1];
  const bundleTotalPrice = product.price + bundleProduct.price;
  const bundleDiscountPrice = Math.round(bundleTotalPrice * 0.85); // 15% bundle extra discount

  const handleAddToCart = () => {
    addToCart(product, selectedVariantId, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariantId, quantity);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddBundle = () => {
    addToCart(product, selectedVariantId, 1);
    addToCart(bundleProduct, bundleProduct.variants[0]?.id, 1);
    showNotification(`Added ${product.name} + ${bundleProduct.name} bundle to your bag!`);
  };

  const handlePinCheck = (e: React.FormEvent) => {
    e.preventDefault();
    checkPincodeDelivery(pinInput);
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.isBestseller))
    .slice(0, 4);

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="text-xs text-[#777777] mb-6 flex items-center gap-2">
          <button onClick={() => setActiveView('home')} className="hover:text-[#242424]">Home</button>
          <span>/</span>
          <button onClick={() => setActiveView('shop')} className="hover:text-[#242424]">Shop</button>
          <span>/</span>
          <button onClick={() => setActiveView('shop')} className="hover:text-[#242424]">{product.category}</button>
          <span>/</span>
          <span className="text-[#242424] font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* 2-Column Split: Sticky Media Gallery (Left) & Contiguous Purchase Module (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Image Gallery with Thumbnails & Zoom */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#E8DDCB]/60 shadow-sm cursor-crosshair group"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <ResponsiveImage
                src={product.images[selectedImageIndex] || product.images[0]}
                sizes="(min-width: 1280px) 584px, (min-width: 1024px) 45vw, calc(100vw - 32px)"
                loading="eager"
                fetchPriority="high"
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'group-hover:scale-105'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Water & Anti-Tarnish Assurance Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8DDCB] text-xs font-medium text-[#242424] flex items-center gap-1.5 shadow-sm">
                <Droplets className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>100% Waterproof Anti-Tarnish</span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  isFavorited
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-white/90 text-[#242424] hover:bg-white'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                {isZoomed ? 'Click to standard view' : 'Click to zoom in'}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                      selectedImageIndex === idx ? 'border-[#C5A46D] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ResponsiveImage src={img} sizes="80px" thumbnail alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#777777]">
                <span className="uppercase tracking-widest text-[#C5A46D] font-semibold">{product.category}</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#242424] tracking-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 text-[#242424] font-medium text-sm">
                  <Star className="w-4 h-4 fill-[#C5A46D] text-[#C5A46D]" />
                  <span className="tabular-nums font-semibold">{product.rating}</span>
                </div>
                <span className="text-xs text-[#777777]">·</span>
                <span className="text-xs text-[#777777] font-medium underline cursor-pointer">
                  {product.reviewCount} Verified Buyer Reviews
                </span>
                <span className="text-xs text-[#777777]">·</span>
                <span className="text-xs text-emerald-700 font-medium">In Stock</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DDCB]/60 shadow-xs flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-[#242424] tabular-nums font-serif">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-[#777777] line-through tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {product.discountPercent}% OFF
                </span>
              )}
              <span className="text-[11px] text-[#777777] ml-auto">Inclusive of all taxes</span>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#242424]">
                  Selected Plating: <span className="text-[#C5A46D]">{activeVariant?.name}</span>
                </label>
                <div className="flex gap-2.5">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                        (selectedVariantId || product.variants[0]?.id) === variant.id
                          ? 'border-[#242424] bg-[#242424] text-white shadow-xs'
                          : 'border-[#E8DDCB] bg-white text-[#242424] hover:bg-[#FAF8F4]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                      <span>{variant.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Main CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity selector */}
                <div className="flex items-center bg-white border border-[#E8DDCB] rounded-full px-3 py-1 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-[#777777] hover:text-[#242424]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#242424] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-[#777777] hover:text-[#242424]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-white border border-[#242424] text-[#242424] hover:bg-[#FAF8F4] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              {/* Buy Now Primary CTA */}
              <button
                onClick={handleBuyNow}
                className="w-full py-4 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buy Now with 1-Click Checkout</span>
              </button>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DDCB]/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#242424]">
                <MapPin className="w-4 h-4 text-[#C5A46D]" />
                <span>Check Delivery & Cash on Delivery Availability</span>
              </div>
              <form onSubmit={handlePinCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 6-digit Indian PIN code"
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF8F4] border border-[#E8DDCB] rounded-lg focus:outline-none focus:border-[#C5A46D]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#242424] text-white text-xs font-semibold rounded-lg hover:bg-[#C5A46D] transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {deliveryEstimate && (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{deliveryEstimate.status}: </span>
                    <span>Estimated arrival in <b>{deliveryEstimate.days}</b>. Free shipping & COD eligible.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Material & Anti-Tarnish Assurance Accordion */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-[#E8DDCB]/60 space-y-2">
                <h4 className="font-serif text-sm font-semibold text-[#242424] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A46D]" />
                  <span>Materials & Anti-Tarnish Technology</span>
                </h4>
                <p className="text-[#777777] leading-relaxed">
                  {product.material}. Our proprietary Physical Vapor Deposition (PVD) method molecularly bonds real 18K gold to 316L medical stainless steel inside a high-vacuum chamber, creating an impervious shield that resists oxidation, pool chlorine, ocean saltwater, and sweat.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#242424]">
                  <div><b>Dimensions:</b> {product.dimensions}</div>
                  <div><b>Weight:</b> {product.weightGrams ? `${product.weightGrams}g` : 'Featherlight'}</div>
                  <div><b>Hypoallergenic:</b> 100% Nickel-Free</div>
                  <div><b>Waterproof:</b> Everyday Safe</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DDCB]/60 space-y-1.5">
                <h4 className="font-serif text-sm font-semibold text-[#242424]">
                  Jewellery Care Guide
                </h4>
                <p className="text-[#777777] leading-relaxed">
                  {product.careInstructions}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Frequently Bought Together Bundle */}
        <div className="mt-16 p-6 sm:p-8 bg-white rounded-3xl border border-[#E8DDCB] shadow-sm">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A46D] block mb-1">
              Curated Style Pairing
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#242424] mb-6">
              Frequently Bought Together
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF8F4] border border-[#E8DDCB] shrink-0">
                  <ResponsiveImage src={product.images[0]} sizes="80px" thumbnail alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-[#242424]">{product.name}</p>
                  <p className="text-[#777777]">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <span className="text-xl font-bold text-[#C5A46D]">+</span>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF8F4] border border-[#E8DDCB] shrink-0">
                  <ResponsiveImage src={bundleProduct.images[0]} sizes="80px" thumbnail alt={bundleProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-[#242424]">{bundleProduct.name}</p>
                  <p className="text-[#777777]">₹{bundleProduct.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="sm:ml-auto text-center sm:text-right space-y-2">
                <div className="text-xs">
                  <span className="text-[#777777] line-through mr-2">₹{bundleTotalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-base font-bold text-[#242424] font-serif">₹{bundleDiscountPrice.toLocaleString('en-IN')}</span>
                  <span className="ml-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Bundle & Save 15%</span>
                </div>
                <button
                  onClick={handleAddBundle}
                  className="px-6 py-2.5 bg-[#242424] hover:bg-[#C5A46D] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm"
                >
                  Add Both To Bag
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-20">
          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#242424] mb-8">
            Complete Your Golden Look
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
