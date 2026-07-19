import { Link, useLocation, useNavigate } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CheckCircle2, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  useEffect(() => {
    // Fire festive premium confetti to wow the user!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2E7D32', '#C8E8C0', '#1A1A1A', '#FFD700']
    });
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F9F8] flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <p className="text-gray-500 mb-4" style={{ fontFamily: 'var(--font-body)' }}>No order details found.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[var(--brand-dark-text)] text-white rounded-full font-bold text-sm cursor-pointer"
          >
            GO HOME
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F8] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-xl mx-auto px-4 py-8 lg:py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-50 text-[var(--brand-cta-green)] rounded-full flex items-center justify-center mb-6 lg:mb-8 shadow-sm">
          <CheckCircle2 className="w-10 h-10 lg:w-12 lg:h-12" />
        </div>

        <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-xs lg:text-sm leading-relaxed max-w-sm mb-6 lg:mb-8" style={{ fontFamily: 'var(--font-body)' }}>
          Thank you for shopping with <b>RichGirl</b>. Your order has been placed and handed to our local courier partner.
        </p>

        {/* Order Info Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 w-full shadow-sm mb-6 lg:mb-8 text-left" style={{ fontFamily: 'var(--font-body)' }}>
          <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
            <span className="text-sm font-extrabold text-gray-900">{order.orderId}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Paid</span>
            <span className="text-sm font-extrabold text-[var(--brand-cta-green)]">₹{order.totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</span>
            <span className="text-sm font-bold text-gray-700 capitalize">{order.payment.method === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Courier Partner</span>
            <span className="text-sm font-bold text-gray-700">FastCourier Local Co.</span>
          </div>
        </div>

        {/* AWB Alert Message */}
        <div className="bg-[var(--brand-mist-green)] rounded-2xl border border-[#C8E8C0] p-4 mb-6 lg:mb-8 text-center text-xs text-[var(--brand-dark-text)] font-semibold w-full leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          ✉️ You will receive your AWB tracking number on your mobile number (+91 {order.shippingAddress?.phone || ''}) once shipped.
        </div>

        {/* CTAs */}
        <div className="w-full" style={{ fontFamily: 'var(--font-body)' }}>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md"
          >
            <Home className="w-4 h-4" /> CONTINUE SHOPPING
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
