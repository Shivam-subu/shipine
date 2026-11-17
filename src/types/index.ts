export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  count?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  description: string;
  material: string;
  dimensions: string;
  weightGrams?: number;
  stock: number;
  images: string[];
  variants: ProductVariant[];
  careInstructions: string;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  waterproof: boolean;
  hypoallergenic: boolean;
  tags?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  houseFlat: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantName?: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'cod_pending';
  paymentMethod: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod';
  trackingNumber: string;
  courierPartner: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'admin';
  savedAddresses: ShippingAddress[];
}
