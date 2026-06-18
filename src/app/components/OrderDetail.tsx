import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
    ArrowLeft,
    Package,
    Truck,
    CreditCard,
    User,
    MapPin,
    Calendar,
    ExternalLink,
    Loader2,
    CheckCircle2,
    Clock,
    ChevronRight,
    Printer
} from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'motion/react';

export function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [shippingStatus, setShippingStatus] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch all orders and find this one for now, 
                // or add a getOrderById if available (api.getAllOrders is what we have)
                const orders = await api.getAllOrders();
                const found = orders.find((o: any) => (o.id || o._id) === id);
                if (found) {
                    setOrder(found);
                    setShippingStatus(found.shippingStatus || 'Processing');
                    setTrackingId(found.trackingId || '');
                    setEstimatedDelivery(found.estimatedDelivery ? new Date(found.estimatedDelivery).toISOString().substring(0, 10) : '');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setUpdating(true);
        try {
            await api.updateAdminOrder(id, {
                shippingStatus,
                trackingId,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
            });
            // Refresh order data
            const orders = await api.getAllOrders();
            const found = orders.find((o: any) => (o.id || o._id) === id);
            setOrder(found);
            alert('Order updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 text-[var(--brand-cta-green)] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading session info...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-8">The order you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-black text-white rounded-xl font-bold">
                    BACK TO DASHBOARD
                </button>
            </div>
        );
    }

    const subtotal = order.products.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
    const total = order.totalAmount || (subtotal + (order.deliveryCharge || 0) - (order.discount || 0));

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20">
            {/* Top Header */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-headline)' }}>
                                Order #{order.orderId}
                            </h1>
                            <p className="text-xs text-gray-400 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">
                            <Printer className="w-4 h-4" /> Print Invoice
                        </button>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
              ${order.shippingStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.shippingStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.shippingStatus}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Products List */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[var(--brand-cta-green)]" /> Items Ordered
                                </h3>
                                <span className="text-xs font-medium text-gray-400">{order.products.length} Products</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.products.map((item: any, idx: number) => (
                                    <div key={idx} className="p-6 flex gap-6">
                                        <div className="w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                                            <img
                                                src={item.image || item.images?.[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <span className="font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-4">SKU: {item.productId?.substring(0, 8)}</p>
                                            <div className="flex flex-wrap gap-4 text-xs font-medium">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className="text-gray-400 capitalize">Color</span>
                                                    <span className="text-gray-900">{item.color}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className="text-gray-400 uppercase">Size</span>
                                                    <span className="text-gray-900">{item.size}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                    <span className="text-gray-400 uppercase">Qty</span>
                                                    <span className="text-gray-900">{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-900 font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="text-green-600 font-medium">+{order.deliveryCharge || 0 === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="text-red-500 font-medium">-₹{order.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-2">
                                    <span className="text-gray-900">Total Amount</span>
                                    <span className="text-[var(--brand-cta-green)]">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tracking / Timeline - Mocked for demo */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-8">
                                <Truck className="w-5 h-5 text-[var(--brand-cta-green)]" /> Delivery Journey
                            </h3>
                            <div className="space-y-8">
                                {[
                                    { status: 'Confirmed', date: order.createdAt, desc: 'Payment verified and order confirmed.', icon: CheckCircle2, active: true },
                                    { status: 'Shipped', date: order.updatedAt, desc: order.trackingId ? `In transit via RG Courier (ID: ${order.trackingId})` : 'Order dispatched from warehouse.', icon: Truck, active: !!order.trackingId },
                                    { status: 'Delivered', date: order.deliveredAt, desc: 'Package handed over to customer.', icon: MapPin, active: order.shippingStatus === 'Delivered' }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-6 relative last:pb-0 pb-8">
                                        {idx < 2 && (
                                            <div className={`absolute top-8 left-4 w-0.5 h-full ${step.active ? 'bg-[var(--brand-cta-green)]' : 'bg-gray-100'}`} />
                                        )}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 
                      ${step.active ? 'bg-[var(--brand-cta-green)] text-white' : 'bg-gray-100 text-gray-300'}`}>
                                            <step.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className={`font-bold ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</h4>
                                                {step.active && step.date && (
                                                    <span className="text-[10px] text-gray-400 font-medium">{new Date(step.date).toDateString()}</span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${step.active ? 'text-gray-500' : 'text-gray-300'}`}>
                                                {step.active ? step.desc : 'Scheduled'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Status & Addresses */}
                    <div className="space-y-6">

                        {/* Action Bar */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-gray-900 mb-6">Manage Status</h3>
                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Update Shipping</label>
                                    <select
                                        value={shippingStatus}
                                        onChange={(e) => setShippingStatus(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] text-sm font-bold transition-all"
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Tracking ID</label>
                                    <input
                                        type="text"
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] text-sm transition-all"
                                        placeholder="Enter RG tracking code"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all shadow-md active:scale-[0.98] disabled:bg-gray-400"
                                >
                                    {updating ? 'SAVING...' : 'UPDATE ORDER'}
                                </button>
                            </form>
                        </div>

                        {/* Customer & Address */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[var(--brand-alt-bg)] rounded-2xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-[var(--brand-cta-green)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Customer</h3>
                                    <p className="text-xs text-gray-400 font-medium">Profile Details</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                    <p className="text-sm font-bold text-gray-900">{order.userName || order.shippingAddress?.fullName || 'Guest User'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Details</label>
                                    <p className="text-sm font-medium text-gray-900 mb-0.5">{order.userEmail || 'No email provided'}</p>
                                    <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.phone || 'No phone provided'}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        Shipping Address <MapPin className="w-3 h-3" />
                                    </label>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {order.shippingAddress?.street}<br />
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                        <span className="font-bold text-gray-900">{order.shippingAddress?.zip}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <CreditCard className="w-5 h-5 text-[var(--brand-cta-green)]" /> Payment Stats
                            </h3>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Method</span>
                                    <span className="text-sm font-bold text-gray-900">{order.payment?.method || 'Razorpay Online'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {order.payment?.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-tight">Transaction ID: {order.payment?.transactionId || 'N/A'}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
