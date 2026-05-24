import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, X, ShieldCheck, CreditCard, DollarSign } from 'lucide-react';
import { api } from '../services/api';

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

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartItems = await api.getCart();
        setItems(cartItems);
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(false);
    if (paymentMethod === 'Razorpay') {
      try {
        const config = await api.getConfig();
        if (config.razorpayKeyId && config.razorpayKeyId.startsWith('rzp_')) {
          setPlacingOrder(true);
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            setPlacingOrder(false);
            alert('Razorpay SDK failed to load. Falling back to simulated checkout.');
            setIsRazorpayOpen(true);
            return;
          }

          const options = {
            key: config.razorpayKeyId,
            amount: total * 100, // in paise
            currency: 'INR',
            name: 'RichGirl',
            description: 'Order Payment',
            handler: async function (response: any) {
              await processOrderPlacement('Razorpay', 'paid', response.razorpay_payment_id);
            },
            prefill: {
              name: address.fullName,
              contact: address.phone
            },
            theme: {
              color: '#0979E3'
            },
            modal: {
              ondismiss: function() {
                setPlacingOrder(false);
              }
            }
          };

          const paymentObject = new (window as any).Razorpay(options);
          paymentObject.open();
        } else {
          setIsRazorpayOpen(true);
        }
      } catch (err) {
        console.error("Failed to load Razorpay config:", err);
        setIsRazorpayOpen(true);
      }
    } else {
      await processOrderPlacement('COD', 'unpaid');
    }
  };

  const handleCheckoutClick = () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (!userId || !userName) {
      alert('Please log in or create an account to proceed with checkout!');
      navigate('/login');
      return;
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
    <div className="min-h-screen bg-[#F8F9F8]">
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
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>Checkout</h3>
            
            <form onSubmit={handleCheckoutSubmit} className="space-y-6" style={{ fontFamily: 'var(--font-body)' }}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  placeholder="e.g. Priya Sharma"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code *</label>
                  <input 
                    type="text" 
                    required 
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="6-digit ZIP code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                <input 
                  type="text" 
                  required 
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  placeholder="Apartment, suite, unit, building, street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                  <input 
                    type="text" 
                    required 
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                  <input 
                    type="text" 
                    required 
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'Razorpay' 
                        ? 'border-[var(--brand-cta-green)] bg-emerald-50 text-[var(--brand-cta-green)]' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-bold">Online Payment</span>
                    <span className="text-[9px] font-semibold text-gray-400">UPI, Cards, Netbanking</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD' 
                        ? 'border-[var(--brand-cta-green)] bg-emerald-50 text-[var(--brand-cta-green)]' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                    <span className="text-[9px] font-semibold text-gray-400">Pay cash at your door</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer text-sm"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-black/5 cursor-pointer text-sm"
                >
                  {paymentMethod === 'Razorpay' ? 'PROCEED TO PAY' : 'CONFIRM COD ORDER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATED RAZORPAY MODAL */}
      {isRazorpayOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0b132b] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-800 flex flex-col relative text-white" style={{ fontFamily: 'var(--font-body)' }}>
            
            {/* Merchant Header */}
            <div className="bg-[#0979E3] p-6 flex justify-between items-center relative">
              <div>
                <h4 className="text-xs font-bold tracking-widest text-[#E0F2FE] uppercase">RICHGIRL PREMIUM WEAR</h4>
                <p className="text-2xl font-black mt-1">₹{total.toLocaleString()}</p>
                <p className="text-[10px] text-blue-100/70 font-semibold mt-0.5">Order ID: RG-{new Date().getFullYear()}-{Math.floor(10000 + Math.random() * 90000)}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-[#0979E3] font-black text-sm tracking-tighter">RG</span>
              </div>
            </div>

            {/* Razorpay Body */}
            <div className="p-8 space-y-6 flex-grow bg-[#131B35]">
              <div className="bg-[#1C2646] p-4 rounded-2xl border border-gray-800/80 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00e676]" />
                <div>
                  <p className="text-xs font-bold text-gray-200">Razorpay Secure Checkout</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Simulated test integration activated.</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Methods Available</p>
                
                <div className="divide-y divide-gray-800 bg-[#1C2646] border border-gray-800/80 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between hover:bg-[#232F57] transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">Cards (Visa, Mastercard, RuPay)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-[#232F57] transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#00e676]">UPI</span>
                      <span className="text-xs font-bold">Google Pay / PhonePe / Paytm</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Simulation CTA */}
              <div className="pt-4 space-y-3">
                <button 
                  type="button" 
                  disabled={placingOrder}
                  onClick={() => processOrderPlacement('Razorpay', 'paid', 'pay_dummy_' + Math.random().toString(36).substring(2, 11))}
                  className="w-full py-4 bg-[#0979E3] hover:bg-[#0866c1] text-white rounded-2xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {placingOrder ? 'PROCESSING ORDER...' : 'SIMULATE PAYMENT SUCCESS'}
                </button>
                
                <button 
                  type="button" 
                  disabled={placingOrder}
                  onClick={() => setIsRazorpayOpen(false)}
                  className="w-full py-4 border border-gray-800 hover:bg-[#1A2342] text-gray-400 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  CANCEL TRANSACTION
                </button>
              </div>
            </div>

            {/* Footer encryption tag */}
            <div className="p-4 bg-[#0b132b] border-t border-gray-900 text-center">
              <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">🔒 Secured by 256-bit AES encryption</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
