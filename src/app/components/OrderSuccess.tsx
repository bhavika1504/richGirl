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

      <main className="flex-grow max-w-xl mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-50 text-[var(--brand-cta-green)] rounded-full flex items-center justify-center mb-8 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-10" style={{ fontFamily: 'var(--font-body)' }}>
          Thank you for shopping with <b>RichGirl</b>. Your order has been placed and handed to our local courier partner.
        </p>

        {/* Order Info Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 w-full shadow-sm mb-10 text-left" style={{ fontFamily: 'var(--font-body)' }}>
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

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full" style={{ fontFamily: 'var(--font-body)' }}>
          <button 
            onClick={() => navigate(`/track/${order.orderId}`)}
            className="flex-1 py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-black/5 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            TRACK COURIER ORDER <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex-1 py-4 border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Home className="w-4 h-4" /> BACK TO HOME
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
