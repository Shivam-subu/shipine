import React, { useState } from 'react';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartShipping,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    setActiveView,
    navigateToProduct
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 999;
  const amountNeeded = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setIsApplying(true);
    await applyCouponCode(couponInput);
    setIsApplying(false);
    setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E8DDCB]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#FAF8F4] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#242424]">
                Your Shopping Bag
              </h2>
              <span className="text-xs text-[#777777]">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#777777] hover:text-[#242424] rounded-full hover:bg-[#FAF8F4] transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3.5 bg-[#FAF8F4] border-b border-[#E8DDCB]/60 text-xs">
            {amountNeeded > 0 ? (
              <p className="text-[#242424] font-medium mb-1.5 flex items-center justify-between">
                <span>Add <b>₹{amountNeeded.toLocaleString('en-IN')}</b> more for <b>Free Delivery</b></span>
                <span className="text-[#C5A46D]">{Math.round(progressPercent)}%</span>
              </p>
            ) : (
              <p className="text-emerald-700 font-semibold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You've unlocked Free Insured Shipping!</span>
              </p>
            )}
            <div className="w-full bg-[#E8DDCB]/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C5A46D] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F4] border border-[#E8DDCB] flex items-center justify-center mx-auto text-[#C5A46D]">
                  <Tag className="w-7 h-7 stroke-[1.2]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#242424]">Your bag is empty</h3>
                <p className="text-xs text-[#777777] max-w-xs mx-auto">
                  Explore our anti-tarnish bestsellers designed for everyday waterproof beauty.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('shop');
                  }}
                  className="px-6 py-3 bg-[#242424] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A46D] transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl border border-[#FAF8F4] hover:border-[#E8DDCB] transition-colors"
                >
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigateToProduct(item.productId);
                    }}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-[#FAF8F4] shrink-0 border border-[#E8DDCB]/60"
                  >
                    <ResponsiveImage
                      src={item.product.images[0]}
                      sizes="80px"
                      thumbnail
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            navigateToProduct(item.productId);
                          }}
                          className="text-left font-serif text-sm font-medium text-[#242424] hover:text-[#C5A46D] line-clamp-1"
                        >
                          {item.product.name}
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#777777] hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#777777] mt-0.5">
                        Variant: <span className="text-[#242424]">{item.variantName || 'Standard'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#E8DDCB] rounded-md overflow-hidden">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#FAF8F4] text-[#242424] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold tabular-nums text-[#242424]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#FAF8F4] text-[#242424] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-[#242424] tabular-nums">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Actions */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8DDCB]/60 bg-[#FAF8F4] space-y-4">
              
              {/* Coupon Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs">
                  <div>
                    <span className="font-semibold text-emerald-800">{appliedCoupon.code}</span>
                    <span className="text-emerald-700 ml-1.5">(-₹{appliedCoupon.discount})</span>
                  </div>
                  <button
                    onClick={removeCouponCode}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon (e.g. FIRST10)"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8DDCB] rounded-lg uppercase placeholder-[#777777] focus:outline-none focus:border-[#C5A46D]"
                  />
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput}
                    className="px-4 py-2 bg-[#242424] text-white text-xs font-semibold rounded-lg hover:bg-[#C5A46D] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#777777]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#242424] tabular-nums font-medium">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#242424] tabular-nums">
                    {cartShipping === 0 ? <b className="text-emerald-700 font-medium">FREE</b> : `₹${cartShipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#242424] pt-2 border-t border-[#E8DDCB]/60">
                  <span>Estimated Total</span>
                  <span className="tabular-nums font-serif text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-[#242424] hover:bg-[#C5A46D] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#777777]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>100% Anti-Tarnish Guarantee & Secure Payments</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
