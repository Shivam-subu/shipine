import React, { useState } from 'react';
import { ResponsiveImage } from '../components/ResponsiveImage.tsx';
import { useStore } from '../context/StoreContext.tsx';
import {
  Package,
  Heart,
  User,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  ShoppingBag,
  Trash2,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const AccountView: React.FC = () => {
  const {
    currentUser,
    orders,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    logout,
    setActiveView,
    navigateToProduct,
    login,
    register
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  // Auth Form State when not logged in
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // If user is not authenticated, display dedicated Member Login / Register screen
  if (!currentUser) {
    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setIsLoading(true);

      if (authMode === 'register') {
        if (password.length < 6) {
          setAuthError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        const success = await register(email, password, fullName, phone);
        if (!success) {
          setAuthError('Registration failed. Please check your details.');
        }
      } else {
        const success = await login(email, password);
        if (!success) {
          setAuthError('Invalid email or password. Please verify your credentials.');
        }
      }
      setIsLoading(false);
    };

    return (
      <div className="bg-[#FAF8F4] min-h-screen py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-[#E8DDCB] shadow-sm overflow-hidden p-6 sm:p-10">
            
            {/* Left Column: Brand Benefits */}
            <div className="md:col-span-5 bg-[#FAF8F4] p-6 sm:p-8 rounded-2xl border border-[#E8DDCB]/60 space-y-6">
              <div className="space-y-1.5">
                <span className="font-serif text-2xl font-semibold tracking-widest text-[#242424] uppercase block">
                  Shipine
                </span>
                <p className="text-xs text-[#777777]">
                  Anti-Tarnish • Waterproof • Hypoallergenic
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E8DDCB] flex items-center justify-center shrink-0 text-[#C5A46D]">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#242424]">Live Courier Tracking</h4>
                    <p className="text-[#777777]">Track your jewellery shipments in real-time with Blue Dart and Delhivery.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E8DDCB] flex items-center justify-center shrink-0 text-[#C5A46D]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#242424]">Saved Wishlist</h4>
                    <p className="text-[#777777]">Save your favourite 18K gold PVD pieces and move to cart anytime.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E8DDCB] flex items-center justify-center shrink-0 text-[#C5A46D]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#242424]">Anti-Tarnish Warranty</h4>
                    <p className="text-[#777777]">All registered orders include our signature waterproof anti-tarnish guarantee.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentication Form */}
            <div className="md:col-span-7 space-y-6 sm:px-4">
              {/* Tab Switcher */}
              <div className="flex border-b border-[#E8DDCB]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                    authMode === 'login'
                      ? 'border-[#242424] text-[#242424]'
                      : 'border-transparent text-[#777777] hover:text-[#242424]'
                  }`}
                >
                  Member Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                    authMode === 'register'
                      ? 'border-[#242424] text-[#242424]'
                      : 'border-transparent text-[#777777] hover:text-[#242424]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <div>
                    <label className="block font-semibold text-[#242424] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#242424] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block font-semibold text-[#242424] mb-1.5">Mobile Number (Optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        placeholder="+91"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-[#242424]">Password</label>
                    {authMode === 'register' && <span className="text-[10px] text-[#777777]">Min. 6 characters</span>}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#777777] hover:text-[#242424] p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isLoading
                    ? 'Connecting to Supabase...'
                    : authMode === 'login'
                    ? 'Sign In to Account'
                    : 'Create My Account'}
                </button>
              </form>

              <div className="text-center text-xs text-[#777777]">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="text-[#777777] hover:text-[#242424] underline"
                >
                  ← Continue browsing storefront
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Account Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F4] border border-[#E8DDCB] text-[#C5A46D] font-serif text-2xl font-bold flex items-center justify-center">
              {currentUser.fullName?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-semibold text-[#242424]">
                  {currentUser.fullName || 'Valued Member'}
                </h1>
                {currentUser.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8DDCB] text-[#242424] uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-[#777777]">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin')}
                className="px-4 py-2 bg-[#242424] text-white hover:bg-[#C5A46D] rounded-full text-xs font-semibold transition-colors"
              >
                Go to Admin Dashboard
              </button>
            )}
            <button
              onClick={logout}
              className="p-2 text-[#777777] hover:text-red-500 rounded-full hover:bg-[#FAF8F4] transition-colors flex items-center gap-1.5 text-xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E8DDCB] mb-8 pb-1 overflow-x-auto">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: wishlist.length },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'profile', label: 'Account Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#242424] border-t-2 border-[#C5A46D] shadow-xs'
                    : 'text-[#777777] hover:text-[#242424]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A46D]' : 'text-[#777777]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] bg-[#FAF8F4] px-2 py-0.5 rounded-full border border-[#E8DDCB]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-[#E8DDCB] text-center space-y-4">
                <Package className="w-12 h-12 text-[#C5A46D] mx-auto stroke-[1.2]" />
                <h3 className="font-serif text-lg font-medium text-[#242424]">No orders placed yet</h3>
                <p className="text-xs text-[#777777] max-w-sm mx-auto">
                  Experience anti-tarnish everyday luxury. Your orders will appear here with live tracking.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-6 py-2.5 bg-[#242424] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A46D] transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDCB] shadow-xs space-y-6">
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#FAF8F4] gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-base text-[#242424]">{order.orderNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#777777] mt-0.5">
                        Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-[#777777] block">Order Total</span>
                      <span className="font-bold text-sm text-[#242424]">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <ResponsiveImage
                          src={item.imageUrl}
                          sizes="64px"
                          thumbnail
                          alt={item.productName}
                          className="w-16 h-16 rounded-xl object-cover border border-[#E8DDCB] bg-[#FAF8F4]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm text-[#242424] truncate">{item.productName}</h4>
                          <p className="text-xs text-[#777777]">{item.variantName} • Qty: {item.quantity}</p>
                          <span className="text-xs font-semibold text-[#242424]">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping & Delivery Tracker Info */}
                  <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#C5A46D]" />
                      <span className="text-[#777777]">Courier Partner:</span>
                      <span className="font-semibold text-[#242424]">{order.courierPartner}</span>
                    </div>

                    {order.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-[#777777]">AWB:</span>
                        <code className="bg-white px-2 py-0.5 rounded border border-[#E8DDCB] font-mono font-medium text-[#242424]">
                          {order.trackingNumber}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-[#E8DDCB] text-center space-y-4">
                <Heart className="w-12 h-12 text-[#C5A46D] mx-auto stroke-[1.2]" />
                <h3 className="font-serif text-lg font-medium text-[#242424]">Your wishlist is empty</h3>
                <p className="text-xs text-[#777777] max-w-sm mx-auto">
                  Click the heart icon on any jewellery piece to save it to your personal collection.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-6 py-2.5 bg-[#242424] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A46D] transition-colors cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlistProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#E8DDCB] overflow-hidden p-3 space-y-3">
                    <div
                      onClick={() => navigateToProduct(p.id)}
                      className="aspect-square rounded-xl overflow-hidden bg-[#FAF8F4] relative cursor-pointer"
                    >
                      <ResponsiveImage src={p.images[0]} sizes="(min-width: 1152px) 260px, (min-width: 1024px) 24vw, (min-width: 768px) 31vw, calc(50vw - 24px)" alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4
                        onClick={() => navigateToProduct(p.id)}
                        className="font-medium text-xs text-[#242424] truncate cursor-pointer hover:text-[#C5A46D]"
                      >
                        {p.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#242424] mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(p)}
                        className="flex-1 py-1.5 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-1.5 border border-[#E8DDCB] rounded-lg text-[#777777] hover:text-red-500 hover:bg-[#FAF8F4] cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {(!currentUser.savedAddresses || currentUser.savedAddresses.length === 0) ? (
              <div className="bg-white p-12 rounded-3xl border border-[#E8DDCB] text-center space-y-4">
                <MapPin className="w-12 h-12 text-[#C5A46D] mx-auto stroke-[1.2]" />
                <h3 className="font-serif text-lg font-medium text-[#242424]">No saved addresses</h3>
                <p className="text-xs text-[#777777] max-w-sm mx-auto">
                  Your delivery address will be saved securely when you place your first order.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentUser.savedAddresses.map((addr, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8DDCB] space-y-2 text-xs">
                    <span className="font-semibold text-sm text-[#242424] block">{addr.fullName}</span>
                    <p className="text-[#777777]">
                      {addr.houseFlat}, {addr.street}<br />
                      {addr.city}, {addr.state} - {addr.pincode}<br />
                      {addr.country}
                    </p>
                    <p className="text-[#777777]">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] max-w-xl shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#242424]">Profile Details</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#777777] block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.fullName || ''}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg bg-[#FAF8F4] text-[#242424]"
                />
              </div>
              <div>
                <label className="text-[#777777] block mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ''}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg bg-[#FAF8F4] text-[#242424]"
                />
              </div>
              <div>
                <label className="text-[#777777] block mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.phone || 'Not provided'}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg bg-[#FAF8F4] text-[#242424]"
                />
              </div>
              <div>
                <label className="text-[#777777] block mb-1">Account Role</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.role === 'admin' ? 'Store Administrator' : 'Verified Customer Member'}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg bg-[#FAF8F4] font-semibold text-[#C5A46D]"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
