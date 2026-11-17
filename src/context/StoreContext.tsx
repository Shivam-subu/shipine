import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, Order, UserProfile, Coupon, ProductReview } from '../types/index.ts';
import { INITIAL_PRODUCTS, CATEGORIES } from '../data/products.ts';

interface StoreContextType {
  products: Product[];
  categories: ProductCategory[];
  cart: CartItem[];
  wishlist: string[];
  currentUser: UserProfile | null;
  activeView: string;
  selectedProductId: string | null;
  selectedCategory: string;
  quickViewProduct: Product | null;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isAuthOpen: boolean;
  appliedCoupon: { code: string; discount: number; description: string } | null;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  deliveryPincode: string;
  deliveryEstimate: { status: string; days: string; codAvailable: boolean } | null;
  orders: Order[];
  isLoading: boolean;

  // Navigation
  setActiveView: (view: string) => void;
  navigateToProduct: (productId: string) => void;
  navigateToCategory: (categorySlug: string) => void;
  setSelectedCategory: (categorySlug: string) => void;

  // Cart
  addToCart: (product: Product, variantId?: string, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  cartShipping: number;
  cartDiscount: number;
  cartTotal: number;

  // Coupon
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCouponCode: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Modals
  setQuickViewProduct: (product: Product | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Auth
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, password?: string, fullName?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  switchUserRole: (role: 'admin' | 'customer') => void;

  // Delivery
  checkPincodeDelivery: (pincode: string) => void;

  // Orders
  createOrder: (orderPayload: any) => Promise<Order>;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SESSION_KEY = 'shipine_session_id';
const CART_KEY = 'shipine_cart_v1';
const WISHLIST_KEY = 'shipine_wishlist_v1';
const USER_KEY = 'shipine_user_v1';
const TOKEN_KEY = 'shipine_auth_token';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<ProductCategory[]>(CATEGORIES);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<{ status: string; days: string; codAvailable: boolean } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [currentUser]);

  // Verify token on mount to restore active authenticated session
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.user) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setCurrentUser(null);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Fetch initial products and orders from Express API
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.warn('Using client products fallback:', err);
    }
  };

  const refreshOrders = async () => {
    try {
      const emailQuery = currentUser?.role === 'admin' ? '' : `?email=${currentUser?.email || ''}`;
      const res = await fetch(`/api/orders${emailQuery}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn('Orders fetch error:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshOrders();
  }, [currentUser]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 3800);
  };

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Management
  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const selectedVariant = product.variants.find(v => v.id === variantId) || product.variants[0];
    const variantKey = selectedVariant ? selectedVariant.id : 'default';

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.variantId === variantKey
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          productId: product.id,
          product,
          variantId: variantKey,
          variantName: selectedVariant?.name || 'Standard',
          quantity,
          price: product.price
        }
      ];
    });

    showNotification(`Added "${product.name}" to your bag.`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showNotification('Item removed from shopping bag.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartShipping = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
  const cartDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const cartTotal = Math.max(0, cartSubtotal + cartShipping - cartDiscount);

  // Coupon Application
  const applyCouponCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: cartSubtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discount: data.discount,
          description: data.description
        });
        showNotification(`Coupon ${data.code} applied: -₹${data.discount}`);
        return true;
      } else {
        showNotification(data.error || 'Invalid coupon code', 'error');
        return false;
      }
    } catch {
      showNotification('Failed to validate coupon code', 'error');
      return false;
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    showNotification('Coupon removed', 'info');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showNotification('Item removed from wishlist.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showNotification('Saved to your wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Auth Operations
  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || '' })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        if (data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
        }
        setIsAuthOpen(false);
        showNotification(`Welcome back, ${data.user.fullName || data.user.email}!`);
        return true;
      } else {
        showNotification(data.error || 'Invalid email or password', 'error');
        return false;
      }
    } catch {
      showNotification('Login error. Please try again.', 'error');
      return false;
    }
  };

  const register = async (email: string, password?: string, fullName?: string, phone?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || '', fullName: fullName || '', phone: phone || '' })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        if (data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
        }
        setIsAuthOpen(false);
        showNotification(`Welcome to Shipine, ${data.user.fullName || data.user.email}!`);
        return true;
      } else {
        showNotification(data.error || 'Registration failed', 'error');
        return false;
      }
    } catch {
      showNotification('Registration error. Please try again.', 'error');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    showNotification('Logged out successfully');
    setActiveView('home');
  };

  const switchUserRole = (role: 'admin' | 'customer') => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      showNotification(`Switched role to ${role}`);
      if (role === 'admin') setActiveView('admin');
      else setActiveView('home');
    } else {
      setIsAuthOpen(true);
    }
  };

  // Delivery Pincode Checker
  const checkPincodeDelivery = (pin: string) => {
    setDeliveryPincode(pin);
    const clean = pin.trim();
    if (clean.length === 6 && /^\d+$/.test(clean)) {
      // Realistic Indian PIN code routing logic
      const metroPrefixes = ['11', '40', '56', '50', '60', '70', '12', '20'];
      const isMetro = metroPrefixes.some(pref => clean.startsWith(pref));
      setDeliveryEstimate({
        status: 'Delivering to ' + clean,
        days: isMetro ? 'Next Day / 2 Business Days' : '3-4 Business Days',
        codAvailable: true
      });
      showNotification(`Delivery available to ${clean}: ${isMetro ? 'Express 1-2 Days' : 'Standard 3-4 Days'}`);
    } else {
      setDeliveryEstimate(null);
      showNotification('Please enter a valid 6-digit Indian PIN code', 'error');
    }
  };

  // Order Placement
  const createOrder = async (orderPayload: any): Promise<Order> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const newOrder = await res.json();
      if (!res.ok) {
        throw new Error(newOrder.error || 'Failed to place order');
      }

      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      setIsLoading(false);
      return newOrder;
    } catch (err: any) {
      setIsLoading(false);
      showNotification(err.message || 'Order failed', 'error');
      throw err;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        currentUser,
        activeView,
        selectedProductId,
        selectedCategory,
        quickViewProduct,
        isCartOpen,
        isSearchOpen,
        isAuthOpen,
        appliedCoupon,
        notification,
        deliveryPincode,
        deliveryEstimate,
        orders,
        isLoading,
        setActiveView,
        navigateToProduct,
        navigateToCategory,
        setSelectedCategory,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setIsCartOpen,
        cartCount,
        cartSubtotal,
        cartShipping,
        cartDiscount,
        cartTotal,
        applyCouponCode,
        removeCouponCode,
        toggleWishlist,
        isInWishlist,
        setQuickViewProduct,
        setIsSearchOpen,
        setIsAuthOpen,
        showNotification,
        login,
        register,
        logout,
        switchUserRole,
        checkPincodeDelivery,
        createOrder,
        refreshOrders,
        refreshProducts
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
