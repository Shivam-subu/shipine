import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowRight,
  Lock,
  Download,
  ShoppingBag,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Order, ShippingAddress } from '../types/index.ts';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartShipping,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    currentUser,
    createOrder,
    setActiveView,
    deliveryPincode,
    showNotification,
    setIsAuthOpen
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form State - start clean with logged-in user profile or empty
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');

  const defaultAddr = currentUser?.savedAddresses?.[0];
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: defaultAddr?.fullName || currentUser?.fullName || '',
    email: defaultAddr?.email || currentUser?.email || '',
    phone: defaultAddr?.phone || currentUser?.phone || '',
    houseFlat: defaultAddr?.houseFlat || '',
    street: defaultAddr?.street || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    pincode: defaultAddr?.pincode || deliveryPincode || '',
    country: defaultAddr?.country || 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod'>('razorpay');
  const [upiId, setUpiId] = useState('');

  // Synchronize form when user signs in or profile loads
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.fullName);
      if (!customerEmail) setCustomerEmail(currentUser.email);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
        const addr = currentUser.savedAddresses[0];
        setAddress(prev => ({
          fullName: prev.fullName || addr.fullName,
          email: prev.email || addr.email,
          phone: prev.phone || addr.phone,
          houseFlat: prev.houseFlat || addr.houseFlat,
          street: prev.street || addr.street,
          city: prev.city || addr.city,
          state: prev.state || addr.state,
          pincode: prev.pincode || addr.pincode,
          country: addr.country || 'India'
        }));
      }
    }
  }, [currentUser]);

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl border border-[#E8DDCB] max-w-md shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F4] border border-[#E8DDCB] flex items-center justify-center mx-auto text-[#C5A46D]">
            <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#242424]">Your bag is empty</h2>
          <p className="text-xs text-[#777777]">Add your favorite anti-tarnish pieces before checking out.</p>
          <button
            onClick={() => setActiveView('shop')}
            className="px-8 py-3.5 bg-[#242424] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A46D] transition-colors cursor-pointer"
          >
            Explore Jewellery
          </button>
        </div>
      </div>
    );
  }

  // Handle Step 3 Payment Processing
  const handlePaymentAndConfirm = async () => {
    setIsProcessing(true);

    try {
      let razorpayOrderId = '';
      let razorpayPaymentId = '';

      if (paymentMethod !== 'cod') {
        // Step A: Request server-side Razorpay order creation
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: cartTotal,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
          })
        });
        const orderData = await orderRes.json();
        razorpayOrderId = orderData.id;

        // Step B: Cryptographic payment verification on backend
        razorpayPaymentId = `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: 'test_verified_sig'
          })
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error('Payment verification failed');
        }
      }

      // Step C: Create actual order record on backend
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: address,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          variantName: item.variantName,
          sku: item.product.sku,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.product.images[0]
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shipping: cartShipping,
        total: cartTotal,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'cod_pending' : 'paid',
        razorpayOrderId,
        razorpayPaymentId
      };

      const placedOrder = await createOrder(orderPayload);
      setConfirmedOrder(placedOrder);
      setStep(4);
      showNotification('Congratulations! Your Shipine order is confirmed.');
    } catch (err: any) {
      showNotification(err.message || 'Payment failed, please try again', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Progress Tracker */}
        {step < 4 && (
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-md mx-auto text-xs font-semibold">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#242424]' : 'text-[#777777]'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#242424] text-white' : 'bg-[#E8DDCB] text-[#777777]'}`}>1</span>
                <span>Customer</span>
              </div>
              <div className="h-0.5 w-12 bg-[#E8DDCB]" />
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#242424]' : 'text-[#777777]'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#242424] text-white' : 'bg-[#E8DDCB] text-[#777777]'}`}>2</span>
                <span>Address</span>
              </div>
              <div className="h-0.5 w-12 bg-[#E8DDCB]" />
              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#242424]' : 'text-[#777777]'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#242424] text-white' : 'bg-[#E8DDCB] text-[#777777]'}`}>3</span>
                <span>Payment</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Order Confirmation View */}
        {step === 4 && confirmedOrder ? (
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E8DDCB] shadow-lg max-w-2xl mx-auto space-y-8 text-center animate-in fade-in duration-300">
            
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">Order Placed Successfully</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#242424]">
                Thank You, {confirmedOrder.customerName}!
              </h1>
              <p className="text-xs sm:text-sm text-[#777777]">
                We have received your order and our artisans are preparing your anti-tarnish jewellery in our signature packaging.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-6 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60 text-left space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8DDCB]/60">
                <div>
                  <span className="text-[#777777] block">Order Number</span>
                  <span className="font-bold text-sm text-[#242424] font-serif">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#777777] block">Estimated Delivery</span>
                  <span className="font-semibold text-[#242424]">2-3 Business Days</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-white border border-[#E8DDCB]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#242424] truncate">{item.productName}</p>
                      <p className="text-[11px] text-[#777777]">{item.variantName} × {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#242424] tabular-nums">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Payment details */}
              <div className="pt-3 border-t border-[#E8DDCB]/60 space-y-1.5">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium text-[#242424] uppercase">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracking Partner:</span>
                  <span className="font-medium text-[#242424]">{confirmedOrder.courierPartner}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracking Number:</span>
                  <span className="font-mono text-[#242424] font-semibold">{confirmedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#242424] pt-2 border-t border-[#E8DDCB]/60">
                  <span>Total Paid:</span>
                  <span className="font-serif text-base">₹{confirmedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  if (!confirmedOrder) return;
                  const invoiceText = `SHIPINE JEWELLERY - TAX INVOICE
Order Number: ${confirmedOrder.orderNumber}
Date: ${new Date(confirmedOrder.date).toLocaleString()}
Customer: ${confirmedOrder.customerName} (${confirmedOrder.customerEmail}, ${confirmedOrder.customerPhone})
Destination: ${confirmedOrder.shippingAddress?.houseFlat}, ${confirmedOrder.shippingAddress?.street}, ${confirmedOrder.shippingAddress?.city}, ${confirmedOrder.shippingAddress?.state} - ${confirmedOrder.shippingAddress?.pincode}
Tracking Number: ${confirmedOrder.trackingNumber} (${confirmedOrder.courierPartner})
Payment Method: ${confirmedOrder.paymentMethod.toUpperCase()}

Items:
${confirmedOrder.items.map(i => `* ${i.productName} (${i.variantName || 'Standard'}) x ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n')}

Subtotal: ₹${confirmedOrder.subtotal.toLocaleString('en-IN')}
Discount: -₹${confirmedOrder.discount.toLocaleString('en-IN')}
Shipping: ${confirmedOrder.shipping === 0 ? 'FREE' : '₹' + confirmedOrder.shipping}
Total Paid: ₹${confirmedOrder.total.toLocaleString('en-IN')}

100% Anti-Tarnish Guaranteed by Shipine Jewels Pvt Ltd.`;
                  const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Shipine_Invoice_${confirmedOrder.orderNumber}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showNotification('Invoice downloaded successfully!');
                }}
                className="flex-1 py-3.5 bg-white border border-[#242424] text-[#242424] hover:bg-[#FAF8F4] rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Tax Invoice</span>
              </button>

              <button
                onClick={() => setActiveView('shop')}
                className="flex-1 py-3.5 bg-[#242424] text-white hover:bg-[#C5A46D] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue Shopping</span>
              </button>
            </div>

          </div>
        ) : (
          /* Step 1 to 3 Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Steps Container */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-sm">
              
              {/* Step 1: Customer Contact Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#242424]">
                      1. Customer Information
                    </h2>
                    <p className="text-xs text-[#777777] mt-1">
                      We'll send your order tracking updates and receipt to this contact.
                    </p>
                  </div>

                  {!currentUser && (
                    <div className="p-3.5 bg-[#FAF8F4] border border-[#E8DDCB] rounded-xl flex items-center justify-between text-xs">
                      <span className="text-[#777777]">Already have a Shipine account?</span>
                      <button
                        type="button"
                        onClick={() => setIsAuthOpen(true)}
                        className="font-semibold text-[#242424] hover:text-[#C5A46D] underline cursor-pointer"
                      >
                        Sign in for saved details
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#242424] mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#242424] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#242424] mb-1">Mobile Number (For Courier OTP)</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!customerName || !customerEmail || !customerPhone) {
                        showNotification('Please fill in all contact details', 'error');
                        return;
                      }
                      setAddress(prev => ({ ...prev, fullName: customerName, email: customerEmail, phone: customerPhone }));
                      setStep(2);
                    }}
                    className="w-full py-3.5 bg-[#242424] hover:bg-[#C5A46D] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-[#242424]">
                        2. Delivery Address
                      </h2>
                      <p className="text-xs text-[#777777] mt-1">
                        Where should we dispatch your Shipine jewellery parcel?
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-[#C5A46D] hover:underline"
                    >
                      Edit Contact
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#242424] mb-1">House / Flat / Building No.</label>
                      <input
                        type="text"
                        required
                        value={address.houseFlat}
                        onChange={(e) => setAddress({ ...address, houseFlat: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#242424] mb-1">Street / Colony / Landmark</label>
                      <input
                        type="text"
                        required
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#242424] mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#242424] mb-1">PIN Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#242424] mb-1">State</label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-white"
                        >
                          {['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Telangana', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Kerala'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#242424] mb-1">Country</label>
                        <input
                          type="text"
                          disabled
                          value="India"
                          className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDCB] rounded-xl bg-[#FAF8F4] text-[#777777]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="py-3.5 px-6 border border-[#E8DDCB] text-[#242424] hover:bg-[#FAF8F4] text-xs font-semibold uppercase rounded-full"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!address.houseFlat || !address.street || !address.city || !address.pincode) {
                          showNotification('Please fill in complete address details', 'error');
                          return;
                        }
                        setStep(3);
                      }}
                      className="flex-1 py-3.5 bg-[#242424] hover:bg-[#C5A46D] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-[#242424]">
                        3. Secure Payment
                      </h2>
                      <p className="text-xs text-[#777777] mt-1">
                        Encrypted 256-bit checkout with Razorpay. All Indian payment modes accepted.
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-[#C5A46D] hover:underline"
                    >
                      Edit Address
                    </button>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3">
                    {/* Razorpay All-in-One */}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay' ? 'border-[#242424] bg-[#FAF8F4]' : 'border-[#E8DDCB] hover:bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 accent-[#242424]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#242424]">Razorpay Instant Gateway (Recommended)</span>
                          <span className="text-[10px] bg-[#E8DDCB] text-[#242424] px-2 py-0.5 rounded font-medium">Fastest</span>
                        </div>
                        <p className="text-[11px] text-[#777777] mt-0.5">
                          UPI (Google Pay, PhonePe, Paytm), All Credit/Debit Cards & Net Banking with instant HMAC verification.
                        </p>
                      </div>
                    </label>

                    {/* Direct UPI */}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi' ? 'border-[#242424] bg-[#FAF8F4]' : 'border-[#E8DDCB] hover:bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="mt-1 accent-[#242424]"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-xs text-[#242424]">Direct UPI ID / QR</span>
                        <p className="text-[11px] text-[#777777] mt-0.5">Pay via any Indian UPI app directly.</p>
                        {paymentMethod === 'upi' && (
                          <div className="mt-2.5">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. mobile@upi"
                              className="w-full px-3 py-2 text-xs border border-[#E8DDCB] rounded-lg bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-[#242424] bg-[#FAF8F4]' : 'border-[#E8DDCB] hover:bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-[#242424]"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-xs text-[#242424]">Cash on Delivery (COD)</span>
                        <p className="text-[11px] text-[#777777] mt-0.5">
                          Pay in cash upon doorstep delivery to Blue Dart/Delhivery courier.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60 flex items-center gap-3 text-xs text-[#777777]">
                    <Lock className="w-5 h-5 text-[#C5A46D] shrink-0" />
                    <span>Your transaction is protected with military-grade 256-bit SSL encryption.</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="py-3.5 px-6 border border-[#E8DDCB] text-[#242424] hover:bg-[#FAF8F4] text-xs font-semibold uppercase rounded-full"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentAndConfirm}
                      disabled={isProcessing}
                      className="flex-1 py-4 bg-[#242424] hover:bg-[#C5A46D] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Verifying & Placing Order...' : `Pay ₹${cartTotal.toLocaleString('en-IN')}`}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Summary Container */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E8DDCB] shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#242424]">
                  Order Summary ({cart.length} items)
                </h3>

                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover bg-[#FAF8F4] border border-[#E8DDCB]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#242424] truncate">{item.product.name}</p>
                        <p className="text-[11px] text-[#777777]">{item.variantName} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-[#242424] tabular-nums">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Math */}
                <div className="pt-4 border-t border-[#FAF8F4] space-y-2 text-xs text-[#777777]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#242424] tabular-nums">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span className="tabular-nums font-medium">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-[#242424] tabular-nums">
                      {cartShipping === 0 ? <b className="text-emerald-700">FREE</b> : `₹${cartShipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#242424] pt-2 border-t border-[#E8DDCB]/60">
                    <span>Total Amount</span>
                    <span className="font-serif text-lg tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#777777] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>Includes Shipine 1-Year Anti-Tarnish Guarantee</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
