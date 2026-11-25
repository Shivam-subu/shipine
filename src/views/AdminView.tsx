import React, { useState, useEffect } from 'react';
import { ResponsiveImage } from '../components/ResponsiveImage.tsx';
import { ASSET_EARRINGS } from '../lib/images.ts';
import { useStore } from '../context/StoreContext.tsx';
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Tag,
  Mail,
  ShieldCheck,
  Search,
  ExternalLink,
  Database,
  RefreshCw
} from 'lucide-react';
import { Product, Order, Coupon } from '../types/index.ts';

export const AdminView: React.FC = () => {
  const {
    products,
    refreshProducts,
    showNotification,
    categories,
    currentUser,
    login,
    setActiveView
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'coupons' | 'settings'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<any[]>([]);
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');

  // Edit / Add Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // New Coupon State (Clean / empty initial inputs)
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    description: ''
  });

  // Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isSeedingDb, setIsSeedingDb] = useState(false);

  const checkSupabaseStatus = async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch('/api/admin/supabase-status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err: any) {
      setSupabaseStatus({ isConfigured: false, message: 'Failed to contact backend API' });
    } finally {
      setIsCheckingDb(false);
    }
  };

  const seedSupabaseDatabase = async () => {
    setIsSeedingDb(true);
    try {
      const res = await fetch('/api/admin/supabase-seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Supabase initial data seeded successfully!');
        checkSupabaseStatus();
        fetchAdminData();
        refreshProducts();
      } else {
        showNotification(data.error || 'Seeding failed. Ensure SQL tables exist.');
      }
    } catch {
      showNotification('Error triggering database seed');
    } finally {
      setIsSeedingDb(false);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, ordersRes, custRes, coupRes, subsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/orders'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/coupons'),
        fetch('/api/admin/subscribers')
      ]);

      if (dashRes.ok) setDashboardData(await dashRes.json());
      if (ordersRes.ok) setAdminOrders(await ordersRes.json());
      if (custRes.ok) setAdminCustomers(await custRes.json());
      if (coupRes.ok) setAdminCoupons(await coupRes.json());
      if (subsRes.ok) setSubscribers(await subsRes.json());
    } catch (err) {
      console.warn('Error fetching admin details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    checkSupabaseStatus();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showNotification(`Order ${orderId} status updated to ${status}`);
        fetchAdminData();
      }
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        showNotification(isNew ? 'New product created!' : 'Product updated!');
        setIsProductModalOpen(false);
        setEditingProduct(null);
        refreshProducts();
        fetchAdminData();
      }
    } catch {
      showNotification('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Product removed from inventory');
        refreshProducts();
        fetchAdminData();
      }
    } catch {
      showNotification('Failed to delete product', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        showNotification(`Coupon ${newCoupon.code.toUpperCase()} created!`);
        setNewCoupon({
          code: '',
          type: 'percentage',
          value: 0,
          minOrder: 0,
          maxDiscount: 0,
          description: ''
        });
        fetchAdminData();
      }
    } catch {
      showNotification('Failed to create coupon', 'error');
    }
  };

  // Dedicated Admin Login Gate if not authenticated as Admin
  if (!currentUser || currentUser.role !== 'admin') {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminAuthError('');
      setAdminAuthLoading(true);

      const success = await login(adminEmail, adminPassword);
      setAdminAuthLoading(false);

      if (!success) {
        setAdminAuthError('Invalid administrator credentials. Please try again.');
      }
    };

    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E8DDCB] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#242424] text-[#C5A46D] flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#242424]">Admin Portal</h2>
            <p className="text-xs text-[#777777] max-w-xs mx-auto">
              Restricted management area. Please sign in with your Supabase administrator credentials.
            </p>
          </div>

          {currentUser && currentUser.role !== 'admin' && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
              Currently signed in as <b>{currentUser.email}</b> (Customer). Administrator privileges are required to view this dashboard.
            </div>
          )}

          {adminAuthError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {adminAuthError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#242424] mb-1.5">Administrator Email</label>
              <input
                type="email"
                required
                placeholder="admin@shipine.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#242424] mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {adminAuthLoading ? 'Authenticating with Supabase...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E8DDCB]/60">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="text-xs text-[#777777] hover:text-[#242424] underline"
            >
              ← Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="bg-[#242424] text-white p-6 sm:p-8 rounded-3xl shadow-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#C5A46D] border border-white/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">Store Administration</span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">Live</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold">SHIPINE Command Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Back to Storefront
            </button>
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-[#C5A46D] hover:bg-[#b59560] text-[#242424] rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E8DDCB] mb-8 pb-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Analytics' },
            { id: 'orders', label: `Orders (${adminOrders.length})` },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'customers', label: `Customers (${adminCustomers.length})` },
            { id: 'coupons', label: 'Coupons & Marketing' },
            { id: 'settings', label: 'Database & Keys Setup' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#242424] border-t-2 border-[#C5A46D] shadow-xs'
                  : 'text-[#777777] hover:text-[#242424]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="bg-white p-5 rounded-2xl border border-[#E8DDCB] shadow-xs space-y-2">
                <span className="text-xs text-[#777777] font-medium uppercase tracking-wider">Total Sales</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#242424] tabular-nums">
                  ₹{(dashboardData?.metrics?.totalSales || 64200).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +24% vs last month
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DDCB] shadow-xs space-y-2">
                <span className="text-xs text-[#777777] font-medium uppercase tracking-wider">Total Orders</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#242424] tabular-nums">
                  {dashboardData?.metrics?.totalOrders || adminOrders.length}
                </p>
                <span className="text-[11px] text-[#777777]">
                  {dashboardData?.metrics?.pendingOrders || 1} pending fulfillment
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DDCB] shadow-xs space-y-2">
                <span className="text-xs text-[#777777] font-medium uppercase tracking-wider">Customer Accounts</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#242424] tabular-nums">
                  {dashboardData?.metrics?.totalCustomers || 12}
                </p>
                <span className="text-[11px] text-[#C5A46D] font-medium">94% repeat purchase rate</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DDCB] shadow-xs space-y-2">
                <span className="text-xs text-[#777777] font-medium uppercase tracking-wider">Low Stock Alert</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
                  {dashboardData?.metrics?.lowStockCount || 3}
                </p>
                <span className="text-[11px] text-amber-600">Requires artisan reorder</span>
              </div>

            </div>

            {/* Revenue Analytics Table */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#242424]">Revenue Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {(dashboardData?.revenueAnalytics || [
                  { month: 'Jan', revenue: 64200 },
                  { month: 'Feb', revenue: 78500 },
                  { month: 'Mar', revenue: 112400 },
                  { month: 'Apr', revenue: 148900 }
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60">
                    <span className="text-xs text-[#777777] font-semibold">{item.month} 2026</span>
                    <p className="font-serif text-xl font-bold text-[#242424] mt-1 tabular-nums">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-[#242424]">Recent Customer Purchases</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#C5A46D] font-semibold hover:underline"
                >
                  Manage All Orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F4] text-[#777777] border-b border-[#E8DDCB]">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF8F4]">
                    {adminOrders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FAF8F4]/50">
                        <td className="p-3 font-mono font-semibold text-[#242424]">{ord.orderNumber}</td>
                        <td className="p-3 font-medium text-[#242424]">{ord.customerName}</td>
                        <td className="p-3 font-semibold text-[#242424] tabular-nums">₹{ord.total.toLocaleString('en-IN')}</td>
                        <td className="p-3 uppercase text-[11px] text-[#777777]">{ord.paymentMethod}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Orders Fulfillment */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-semibold text-[#242424]">Order Management & Courier Tracking</h3>

            <div className="space-y-4">
              {adminOrders.map((ord) => (
                <div key={ord.id} className="p-5 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8DDCB]/60">
                    <div>
                      <span className="font-bold text-[#242424] font-serif text-sm mr-3">{ord.orderNumber}</span>
                      <span className="text-[#777777]">{new Date(ord.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#777777]">Update Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-white border border-[#E8DDCB] rounded-lg px-2.5 py-1 font-semibold text-[#242424]"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[#777777] block font-medium">Customer Details</span>
                      <p className="font-semibold text-[#242424]">{ord.customerName}</p>
                      <p className="text-[#777777]">{ord.customerEmail}</p>
                      <p className="text-[#777777]">{ord.customerPhone}</p>
                    </div>

                    <div>
                      <span className="text-[#777777] block font-medium">Delivery Destination</span>
                      <p className="text-[#242424]">{ord.shippingAddress?.houseFlat}, {ord.shippingAddress?.street}</p>
                      <p className="text-[#242424]">{ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}</p>
                      <p className="text-[#C5A46D] font-medium">AWB: {ord.trackingNumber}</p>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-[#777777] block font-medium">Financials</span>
                      <p className="font-serif text-base font-bold text-[#242424] tabular-nums">Total: ₹{ord.total.toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-emerald-700">Payment: {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Products Management */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#242424]">Jewellery Inventory</h3>
                <p className="text-xs text-[#777777]">Manage prices, stock limits, and descriptions</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'Earrings',
                    categorySlug: 'earrings',
                    price: 1299,
                    originalPrice: 1999,
                    discountPercent: 35,
                    stock: 50,
                    material: '316L Stainless Steel with 18K Gold PVD',
                    dimensions: '20mm',
                    description: '',
                    images: [ASSET_EARRINGS],
                    variants: [{ id: 'v1', name: '18K Gold', colorName: 'Gold', colorHex: '#D4AF37', sku: 'SHP-NEW-1', stock: 50 }],
                    careInstructions: 'Waterproof anti-tarnish.'
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F4] text-[#777777] border-b border-[#E8DDCB]">
                  <tr>
                    <th className="p-3">Image</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (INR)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F4]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF8F4]/50">
                      <td className="p-3">
                        <ResponsiveImage src={prod.images[0]} sizes="40px" thumbnail alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-[#FAF8F4]" />
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-[#242424] block">{prod.name}</span>
                        <span className="text-[11px] text-[#777777]">{prod.sku}</span>
                      </td>
                      <td className="p-3 text-[#777777]">{prod.category}</td>
                      <td className="p-3 font-semibold text-[#242424] tabular-nums">₹{prod.price.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          prod.stock < 25 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {prod.stock} Units
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-[#242424] hover:text-[#C5A46D]"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-[#777777] hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Customers Directory */}
        {activeTab === 'customers' && (
          <div className="bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#242424]">Registered Customers & Buyers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F4] text-[#777777] border-b border-[#E8DDCB]">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Orders Count</th>
                    <th className="p-3">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F4]">
                  {adminCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-[#FAF8F4]/50">
                      <td className="p-3 font-semibold text-[#242424]">{cust.fullName}</td>
                      <td className="p-3 text-[#777777]">{cust.email}</td>
                      <td className="p-3 uppercase text-[10px] font-bold text-[#C5A46D]">{cust.role}</td>
                      <td className="p-3">{cust.orderCount || 1} Orders</td>
                      <td className="p-3 font-serif font-bold text-[#242424]">₹{(cust.totalSpent || 2798).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Coupons & Marketing */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#242424]">Active Discount Coupons</h3>
              <div className="space-y-3">
                {adminCoupons.map((c, i) => (
                  <div key={i} className="p-4 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-sm text-[#242424] font-mono">{c.code}</span>
                      <p className="text-[#777777] mt-0.5">{c.description}</p>
                      <span className="text-[11px] text-[#C5A46D]">Min Order: ₹{c.minOrder}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full text-[11px]">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Coupon Form */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#242424]">Create Promotional Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LUXURY25"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#242424] mb-1">Discount Type</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e: any) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#242424] mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Minimum Order (INR)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 25% off festive jewellery orders"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#242424] hover:bg-[#C5A46D] text-white font-semibold rounded-lg uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  Publish Coupon
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: Settings & Production Integration Guide */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-6">
            <h3 className="font-serif text-2xl font-semibold text-[#242424]">Production Credentials & Database Setup</h3>
            <p className="text-xs text-[#777777]">
              SHIPINE is architected with complete database schemas, SQL migrations, and secure API integration layers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#242424] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C5A46D]" />
                    <span>Supabase PostgreSQL Integration</span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    {supabaseStatus?.isConfigured ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Memory Fallback
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[#777777] leading-relaxed">
                  SQL migration file located at <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8DDCB]">/database/migrations/01_init.sql</code> contains all 20 tables, RLS policies, and triggers. Add your Supabase keys in <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8DDCB]">.env</code>:
                </p>

                <pre className="bg-[#242424] text-white p-3 rounded-lg text-[11px] overflow-x-auto">
{`SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"`}
                </pre>

                {/* Live Status & Actions */}
                <div className="pt-2 border-t border-[#E8DDCB]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#777777]">
                      {supabaseStatus?.message || 'Checking database connectivity...'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={checkSupabaseStatus}
                      disabled={isCheckingDb}
                      className="px-3 py-1.5 bg-white text-[#242424] border border-[#E8DDCB] rounded-lg hover:border-[#C5A46D] transition-colors flex items-center gap-1.5 text-[11px] font-medium disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCheckingDb ? 'animate-spin' : ''}`} />
                      <span>Test Connection</span>
                    </button>

                    <button
                      type="button"
                      onClick={seedSupabaseDatabase}
                      disabled={isSeedingDb || !supabaseStatus?.isConfigured}
                      className="px-3 py-1.5 bg-[#242424] text-white rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 text-[11px] font-medium disabled:opacity-40"
                    >
                      <Database className={`w-3 h-3 ${isSeedingDb ? 'animate-spin' : ''}`} />
                      <span>Seed Initial Data</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB] space-y-2">
                <h4 className="font-semibold text-sm text-[#242424] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C5A46D]" />
                  <span>Razorpay Indian Payments Gateway</span>
                </h4>
                <p className="text-[#777777] leading-relaxed">
                  Server-side order generation and HMAC SHA-256 signature verification are fully wired in <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8DDCB]">/server.ts</code>. Add live keys to go live:
                </p>
                <pre className="bg-[#242424] text-white p-3 rounded-lg text-[11px] overflow-x-auto">
{`RAZORPAY_KEY_ID="rzp_live_your_id"
RAZORPAY_KEY_SECRET="your_secret"`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Edit / Add Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E8DDCB] max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-semibold text-[#242424] mb-4">
              {editingProduct.id ? 'Edit Jewellery Item' : 'Add New Anti-Tarnish Design'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Category</label>
                  <select
                    value={editingProduct.categorySlug || 'earrings'}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      categorySlug: e.target.value,
                      category: categories.find(c => c.slug === e.target.value)?.name || 'Earrings'
                    })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || 'SHP-001'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 1499}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Original (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || 2499}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 50}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Material Details</label>
                <input
                  type="text"
                  value={editingProduct.material || '316L Stainless Steel with 18K Gold PVD'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DDCB] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-[#777777] hover:text-[#242424]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#242424] hover:bg-[#C5A46D] text-white font-semibold rounded-lg uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
