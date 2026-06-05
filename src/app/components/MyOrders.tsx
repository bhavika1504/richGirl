import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from './Navbar';
import { Package, ArrowLeft, MapPin, ChevronRight, Truck, Clock } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'motion/react';

const STATUS_COLORS: Record<string, string> = {
    Processing: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-indigo-100 text-indigo-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

export function MyOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;
                const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const response = await fetch(`${baseUrl}/orders/user/${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    cache: 'no-store'
                });
                const data = await response.json();
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-[#F7FDF5] pb-24">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--brand-border)]"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
                    </button>
                    <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--brand-dark-text)' }}>
                        My Orders
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand-cta-green)]" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-[var(--brand-border)]">
                        <div className="w-20 h-20 bg-[var(--brand-mist-green)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-[var(--brand-cta-green)]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-headline)' }}>No orders yet</h3>
                        <p className="text-gray-400 text-sm mb-6">Looks like you haven't placed any orders. Start shopping!</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="px-8 py-3 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
                        >
                            BROWSE THE SHOP
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl border border-[var(--brand-border)] p-6 shadow-sm"
                            >
                                {/* Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Order ID</p>
                                        <p className="font-bold text-[var(--brand-dark-text)]" style={{ fontFamily: 'var(--font-body)' }}>
                                            {order.orderId}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.shippingStatus] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.shippingStatus}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {(order.products || []).slice(0, 2).map((p: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3">
                                            {p.image && (
                                                <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-800 truncate">{p.name}</p>
                                                <p className="text-xs text-gray-400">Size: {p.size} · Color: {p.color} · Qty: {p.quantity}</p>
                                            </div>
                                            <p className="text-sm font-bold text-[var(--brand-cta-green)]">₹{p.priceAtTimeOfPurchase?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                    {order.products?.length > 2 && (
                                        <p className="text-xs text-gray-400 font-semibold">+{order.products.length - 2} more items</p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-50 pt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs">{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                                        </div>
                                        <div className="h-4 w-px bg-gray-200" />
                                        <p className="font-bold text-base text-[var(--brand-dark-text)]">₹{order.totalAmount?.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/track/${order.orderId}`)}
                                        className="flex items-center gap-2 bg-[var(--brand-mist-green)] hover:bg-[var(--brand-cta-green)] hover:text-white text-[var(--brand-cta-green)] text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                                    >
                                        <Truck className="w-3.5 h-3.5" />
                                        TRACK ORDER
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
