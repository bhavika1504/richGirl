import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Search, MapPin, Truck, Calendar, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useParams, useNavigate } from 'react-router';

export function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderIdInput, setOrderIdInput] = useState(id || '');
  const [orderData, setOrderData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (searchId: string) => {
    if (!searchId.trim()) return;
    setLoading(true);
    setError('');
    setOrderData(null);
    try {
      const data = await api.trackOrder(searchId.trim());
      setOrderData(data);
    } catch (err: any) {
      console.error('Tracking fetch failed:', err);
      setError(err.response?.data?.message || 'Order not found. Please verify your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTracking(id);
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      fetchTracking(orderIdInput);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F8] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
        {/* Go Back Link */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 text-sm font-semibold transition-all"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO HOME
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:p-12 mb-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
              Track Your Courier
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Enter your RichGirl Order ID (e.g. RG-2026-XXXXX) below to track your local courier shipment status in real time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6">
            <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:border-[var(--brand-cta-green)] focus-within:bg-white transition-all shadow-sm">
              <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
              <input 
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter RichGirl Order ID..."
                className="w-full bg-transparent border-none py-3 px-3 outline-none text-sm font-bold text-gray-800"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-[var(--brand-dark-text)] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] disabled:bg-gray-400 cursor-pointer flex-shrink-0"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {loading ? 'Searching...' : 'TRACK'}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs font-semibold mt-3 text-center" style={{ fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}
          </form>
        </div>

        {orderData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>Order Status</p>
                  <p className="font-extrabold text-gray-800 text-base" style={{ fontFamily: 'var(--font-body)' }}>{orderData.shippingStatus}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>Tracking ID (FastCourier)</p>
                  <p className="font-extrabold text-gray-800 text-base" style={{ fontFamily: 'var(--font-body)' }}>{orderData.trackingId || 'Pending dispatch'}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>Estimated Delivery</p>
                  <p className="font-extrabold text-gray-800 text-base" style={{ fontFamily: 'var(--font-body)' }}>
                    {orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery).toLocaleDateString() : 'To be updated'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main tracking area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Timeline */}
              <div className="lg:col-span-7">
                <h3 className="text-xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'var(--font-headline)' }}>Delivery Timeline</h3>
                
                <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                  {orderData.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      {/* Dot indicator */}
                      <div className={`absolute -left-8 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white ${
                        step.completed 
                          ? 'bg-[var(--brand-cta-green)] text-white shadow-md shadow-green-100' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-white ${step.completed ? 'opacity-100' : 'bg-gray-400'}`} />
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h4 className={`font-bold text-base ${step.completed ? 'text-gray-900' : 'text-gray-400'}`} style={{ fontFamily: 'var(--font-body)' }}>
                            {step.status}
                          </h4>
                          {step.completed && step.date && (
                            <span className="text-xs text-gray-400 font-semibold">
                              {new Date(step.date).toLocaleDateString()} at {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 leading-relaxed ${step.completed ? 'text-gray-500 font-medium' : 'text-gray-300'}`} style={{ fontFamily: 'var(--font-body)' }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details Card */}
              <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>Shipment Details</h3>
                  
                  <div className="space-y-4" style={{ fontFamily: 'var(--font-body)' }}>
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Address</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{orderData.shippingAddress.fullName}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {orderData.shippingAddress.street}, {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.zip}
                        </p>
                        <p className="text-sm text-gray-500">Phone: {orderData.shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-100 pt-4 flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Local Courier Partner</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">FastCourier Local Co.</p>
                        <p className="text-xs text-gray-500 mt-0.5">Custom localized third-party API integration enabled.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-body)' }}>Need Help?</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                    If you have any questions regarding your courier delivery status, contact support at <b>support@richgirl.com</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
