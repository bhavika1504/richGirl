import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, X, ShieldCheck, CreditCard, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { INDIA_STATES, INDIA_STATES_CITIES } from '../data/indiaCities';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkout and payment states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('Razorpay');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const checkoutAvailableCities = address.state ? (INDIA_STATES_CITIES[address.state] || []) : [];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cartItems, addresses] = await Promise.all([
          api.getCart(),
          localStorage.getItem('token') ? api.getAddresses() : Promise.resolve([])
        ]);
        setItems(cartItems);
        setSavedAddresses(addresses || []);

        // Auto-select default address if available
        const defaultAddr = addresses?.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setAddress(defaultAddr);
        }
      } catch (error) {
        console.error("Failed to load cart/addresses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const updateQuantity = async (id: string | number, size: string, color: string, delta: number) => {
    const item = items.find(i => i.id === id && i.size === size && i.color === color);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);

    // Optimistic update
    setItems(prev => prev.map(i =>
      (i.id === id && i.size === size && i.color === color) ? { ...i, quantity: newQuantity } : i
    ));

    try {
      await api.updateCartQuantity(id.toString(), size, color, newQuantity);
    } catch (error) {
      // Revert on error
      setItems(prev => prev.map(i =>
        (i.id === id && i.size === size && i.color === color) ? { ...i, quantity: item.quantity } : i
      ));
      console.error("Failed to update quantity:", error);
    }
  };

  const removeItem = async (id: string | number, size: string, color: string) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)));

    try {
      await api.removeFromCart(id.toString(), size, color);
    } catch (error) {
      setItems(previousItems);
      console.error("Failed to remove item:", error);
    }
  };


  const handleProcessRazorpay = async () => {
    setPlacingOrder(true);
    try {
      const config = await api.getConfig();
      if (!config.razorpayKeyId) {
        throw new Error('Razorpay Key ID missing in configuration');
      }

      // 1. Create order on backend
      const razorpayOrder = await api.createRazorpayOrder(total);

      // 2. Configure Razorpay options
      const options = {
        key: config.razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'RichGirl',
        description: 'Payment for your order',
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            const verification = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verification.verified) {
              await processOrderPlacement('Razorpay', 'paid', response.razorpay_payment_id);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert('An error occurred during payment verification.');
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        theme: {
          color: '#10B981' // brand-cta-green
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay Error:", err);
      setPlacingOrder(false);
      alert(`Payment Initialization Failed: ${err.message || 'Please try again.'}`);
    }
  };

  const handleCheckoutClick = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    const userObj = userJson ? JSON.parse(userJson) : null;

    // Pre-fill contact details from user profile if address is empty
    if (userObj) {
      if (!address.fullName || !address.phone) {
        setAddress(prev => ({
          ...prev,
          fullName: prev.fullName || userObj?.name || '',
          phone: prev.phone || userObj?.phone || ''
        }));
      }
    }

    if (token && savedAddresses.length > 0 && !selectedAddressId) {
      setShowAddressForm(false);
    } else {
      setShowAddressForm(true);
    }

    setIsCheckoutOpen(true);
  };


  const processOrderPlacement = async (method: string, status: string, paymentId?: string) => {
    setPlacingOrder(true);
    try {
      const orderData = {
        products: items.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          priceAtTimeOfPurchase: item.price
        })),
        totalAmount: total,
        discount: discount,
        deliveryCharge: shipping,
        shippingAddress: {
          ...address,
          country: "India"
        },
        payment: {
          method,
          status,
          paymentId
        }
      };

      const createdOrder = await api.placeOrder(orderData);

      // If a new address was used, save it to the profile (only for logged in users)
      if (showAddressForm && (localStorage.getItem('token') || sessionStorage.getItem('token'))) {
        try {
          await api.addAddress(address);
        } catch (addrErr) {
          console.error("Failed to save address:", addrErr);
        }
      }

      // Clear local guest cart
      localStorage.removeItem('guestCart');
      setItems([]);
      setIsRazorpayOpen(false);
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (error) {
      console.error("Failed to place order:", error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = items.reduce((sum, item) => sum + (((item.originalPrice || item.price) - item.price) * item.quantity), 0);
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-cta-green)] mb-4"></div>
          <p style={{ fontFamily: 'var(--font-body)' }}>Loading your cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-[var(--brand-mist-green)] rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-[var(--brand-cta-green)]" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-headline)', color: 'var(--brand-dark-text)' }}>Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-xs" style={{ fontFamily: 'var(--font-body)' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/shop"
            className="px-8 py-3 bg-[var(--brand-cta-green)] text-white rounded-full font-medium transition-transform hover:scale-105 active:scale-95"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            START SHOPPING
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F8] pb-20 lg:pb-0">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 py-8 lg:py-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--brand-border)] transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
          </button>
          <div className="flex items-center gap-2 text-[11px] lg:text-[12px]" style={{ fontFamily: 'var(--font-body)' }}>
            <Link to="/" className="text-[var(--brand-secondary-text)]">Home</Link>
            <ChevronRight className="w-3 h-3 text-[var(--brand-border)]" />
            <span className="text-[var(--brand-dark-text)] font-semibold">Shopping Cart</span>
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold mb-10" style={{ fontFamily: 'var(--font-headline)', color: 'var(--brand-dark-text)' }}>
          Shopping Cart <span className="text-lg font-normal text-gray-400">({items.length} items)</span>
        </h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-4 lg:p-6 rounded-2xl border border-[var(--brand-border)] flex gap-4 lg:gap-6"
                >
                  <div className="w-24 h-32 lg:w-32 lg:h-44 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm lg:text-lg lg:max-w-[80%]" style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}>
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4 lg:w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-xs lg:text-sm text-gray-500 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                        Size: <span className="text-[var(--brand-dark-text)] font-medium mr-4">{item.size}</span>
                        Color: <span className="text-[var(--brand-dark-text)] font-medium">{item.color}</span>
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-[var(--brand-border)] rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, -1)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Minus className="w-3 h-3 lg:w-4 h-4 text-[var(--brand-dark-text)]" />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm lg:text-base" style={{ fontFamily: 'var(--font-body)' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, 1)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Plus className="w-3 h-3 lg:w-4 h-4 text-[var(--brand-dark-text)]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-lg lg:text-xl font-bold text-[var(--brand-cta-green)]" style={{ fontFamily: 'var(--font-price)' }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs lg:text-sm text-gray-400 line-through" style={{ fontFamily: 'var(--font-price)' }}>
                          ₹{(item.originalPrice * item.quantity).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/shop" className="inline-flex items-center gap-2 mt-8 text-[var(--brand-cta-green)] font-semibold hover:gap-3 transition-all" style={{ fontFamily: 'var(--font-body)' }}>
              <ArrowLeft className="w-4 h-4" />
              CONTINUE SHOPPING
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-[var(--brand-border)] sticky top-24">
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-headline)', color: 'var(--brand-dark-text)' }}>Order Summary</h2>

              <div className="space-y-4 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                <div className="flex justify-between text-gray-600">
                  <span>Bag Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--brand-cta-green)]">
                  <span>Bag Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? <span className="text-[var(--brand-cta-green)]">FREE</span> : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[var(--brand-border)] pt-4 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}>Order Total</span>
                  <span className="text-2xl font-bold text-[var(--brand-cta-green)]" style={{ fontFamily: 'var(--font-price)' }}>₹{total.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">* Inclusive of all taxes</p>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/5 cursor-pointer"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                PLACE ORDER
              </button>

              <div className="mt-6 p-4 bg-[var(--brand-mist-green)] rounded-xl border border-[#C8E8C0] flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--brand-cta-green)]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-xs text-[var(--brand-dark-text)] leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                  Yay! You saved <b>₹{discount.toLocaleString()}</b> on this order
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-8 relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-700" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
              {showAddressForm ? 'Delivery Address' : 'Select Delivery Address'}
            </h3>

            {!showAddressForm && savedAddresses.length > 0 ? (
              <div className="space-y-4 mb-8">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => {
                      setSelectedAddressId(addr._id);
                      setAddress(addr);
                    }}
                    className={`w-full text-left p-5 border-2 rounded-2xl transition-all ${selectedAddressId === addr._id
                      ? 'border-[var(--brand-cta-green)] bg-emerald-50'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] bg-[var(--brand-cta-green)] text-white px-2 py-0.5 rounded-full uppercase font-bold">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                    <p className="text-sm text-gray-500 font-medium">📞 {addr.phone}</p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setSelectedAddressId(null);
                    setAddress({ fullName: address.fullName, phone: address.phone, street: '', city: '', state: '', zip: '' });
                  }}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[var(--brand-cta-green)] font-bold hover:border-[var(--brand-cta-green)] hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  ADD NEW ADDRESS
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setIsCheckoutOpen(false); if (paymentMethod === 'Razorpay') { handleProcessRazorpay(); } else { processOrderPlacement('COD', 'unpaid'); } }} className="space-y-6" style={{ fontFamily: 'var(--font-body)' }}>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs font-bold text-[var(--brand-cta-green)] hover:underline mb-4 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> USE SAVED ADDRESS
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                      placeholder="House No, Building, Area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                      placeholder="6-digit ZIP"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                    <select
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value, city: '' })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="">Select State</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                    {checkoutAvailableCities.length > 0 ? (
                      <select
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium appearance-none cursor-pointer"
                      >
                        <option value="">Select City</option>
                        {checkoutAvailableCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input type="text" disabled placeholder="Select a state first"
                        className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-3.5 px-4 text-sm text-gray-400 cursor-not-allowed" />
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Payment Method Section (Only show after address selection/entry) */}
            {(selectedAddressId || showAddressForm) && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Payment Method</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'Razorpay'
                      ? 'border-[var(--brand-cta-green)] bg-emerald-50 text-[var(--brand-cta-green)]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-bold">Online Payment</span>
                    <span className="text-[9px] font-semibold text-gray-400">Cards, UPI, Netbanking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'COD'
                      ? 'border-[var(--brand-cta-green)] bg-emerald-50 text-[var(--brand-cta-green)]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                    <span className="text-[9px] font-semibold text-gray-400">Pay at your door</span>
                  </button>
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer text-sm"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (showAddressForm) {
                        if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
                          alert('Please fill all required address fields');
                          return;
                        }
                      }

                      setIsCheckoutOpen(false);
                      if (paymentMethod === 'Razorpay') {
                        handleProcessRazorpay();
                      } else {
                        processOrderPlacement('COD', 'unpaid');
                      }
                    }}
                    className="flex-1 py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-black/5 cursor-pointer text-sm"
                  >
                    {paymentMethod === 'Razorpay' ? 'PROCEED TO PAY' : 'CONFIRM ORDER'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
