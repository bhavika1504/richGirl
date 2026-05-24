import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  X,
  Upload
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { api } from '../services/api';
import axios from 'axios';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>({ totalProducts: 0, lowStock: 0, activeOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // Add Product Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    fabric: '',
    colors: '',
    sizes: ['S', 'M', 'L', 'XL'],
    type: 'western'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Update Order Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, usersData, statsData] = await Promise.all([
        api.getProducts(),
        api.getAllOrders(),
        api.getAllUsers(),
        api.getAdminStats()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setUsers(usersData);
      setDbStats(statsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600'; // high-quality fallback

      if (imageFile) {
        try {
          const config = await api.getConfig();
          if (config.cloudinaryCloudName && config.cloudinaryUploadPreset) {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('upload_preset', config.cloudinaryUploadPreset);
            const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
              formData
            );
            imageUrl = res.data.secure_url;
          }
        } catch (uploadErr) {
          console.error('Cloudinary upload failed, using fallback:', uploadErr);
        }
      }

      const colorsArray = newProduct.colors
        ? newProduct.colors.split(',').map((c) => c.trim())
        : ['Black', 'Off-White'];

      await api.createProduct({
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
        fabric: newProduct.fabric,
        colors: colorsArray,
        sizes: newProduct.sizes,
        image: imageUrl,
        type: newProduct.type
      });

      setIsAddModalOpen(false);
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: '',
        discountPrice: '',
        fabric: '',
        colors: '',
        sizes: ['S', 'M', 'L', 'XL'],
        type: 'western'
      });
      setImageFile(null);
      setImagePreview('');
      reloadData();
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const openOrderUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setTrackingId(order.trackingId || '');
    setShippingStatus(order.status || order.shippingStatus || 'Processing');
    setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().substring(0, 10) : '');
  };

  const handleOrderUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingOrder(true);
    try {
      await api.updateAdminOrder(selectedOrder.id || selectedOrder._id, {
        shippingStatus,
        trackingId,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
      });
      setSelectedOrder(null);
      reloadData();
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setUpdatingOrder(false);
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${dbStats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: dbStats.activeOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Products', value: dbStats.totalProducts.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock', value: dbStats.lowStock.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2">
             <h1 className="text-xl font-extrabold tracking-tighter" style={{ fontFamily: 'var(--font-headline)' }}>RICH GIRL</h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'users', label: 'Users', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                ? 'bg-[var(--brand-cta-green)] text-white shadow-lg shadow-green-100' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={() => navigate('/')}
             className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium"
           >
             <ArrowLeft className="w-5 h-5" />
             Exit Admin
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-headline)' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>Manage your store's inventory and orders</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Quick Search..." 
                className="bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-cta-green)] transition-all w-64"
              />
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[var(--brand-dark-text)] text-white px-6 py-2.5 rounded-full font-bold hover:bg-black transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                ADD PRODUCT
              </button>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <MoreVertical className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
              <h4 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-price)' }}>{stat.value}</h4>
            </div>
          ))}
        </div>

        {/* Dynamic Table Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
             <h3 className="font-bold text-gray-900">Recent {activeTab}</h3>
             <button className="text-sm font-bold text-[var(--brand-cta-green)] flex items-center gap-1 hover:underline">
               View All <ChevronRight className="w-4 h-4" />
             </button>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'products' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden">
                            <img src={product.image || (product.images?.[0])} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">#{product.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: product.inStock ? '80%' : '20%' }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{product.inStock ? 'Yes' : 'No'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          product.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'orders' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">{order.orderId}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{order.userName}</p>
                        <p className="text-xs text-gray-500">{order.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {order.status || 'Processing'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => openOrderUpdateModal(order)}
                          className="text-[var(--brand-cta-green)] text-sm font-bold hover:underline cursor-pointer"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.isAdmin ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-8 relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-700" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>Add New Product</h3>
            
            <form onSubmit={handleProductSubmit} className="space-y-6" style={{ fontFamily: 'var(--font-body)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. Vintage Velvet Anarkali Kurta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <input 
                    type="text" 
                    required 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. Kurtas, Dresses, Co-ords"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium resize-none"
                  placeholder="Tell customers about the fabric, design, embroidery, fit, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (INR) *</label>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="2499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Discount Price (INR)</label>
                  <input 
                    type="number" 
                    value={newProduct.discountPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="1999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type *</label>
                  <select 
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  >
                    <option value="western">Western</option>
                    <option value="indian">Indian Wear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fabric Details</label>
                  <input 
                    type="text" 
                    value={newProduct.fabric}
                    onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. Pure Cotton, Banarasi Silk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Colors (Comma separated)</label>
                  <input 
                    type="text" 
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. Ruby Red, Mustard, Charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    required={!imagePreview}
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="relative w-32 h-40 rounded-2xl overflow-hidden shadow-md">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[var(--brand-cta-green)] shadow-sm mb-3">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Click to upload image</p>
                      <p className="text-xs text-gray-400">Supports PNG, JPG, JPEG (Max 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={submittingProduct}
                  className="flex-1 py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:bg-gray-400 cursor-pointer"
                >
                  {submittingProduct ? 'UPLOADING & SAVING...' : 'ADD PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 p-8 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-700" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>Update Order Status</h3>
            <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'var(--font-body)' }}>Order: {selectedOrder.orderId}</p>
            
            <form onSubmit={handleOrderUpdateSubmit} className="space-y-6" style={{ fontFamily: 'var(--font-body)' }}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Status</label>
                <select 
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-bold"
                >
                  <option value="Processing">Processing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped (In Transit)</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Local Courier Tracking ID</label>
                <input 
                  type="text" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  placeholder="e.g. FC-98234-DEL"
                />
                <p className="text-[10px] text-gray-400 mt-1">This will update the customer's delivery tracking timeline.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Delivery Date</label>
                <input 
                  type="date" 
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={updatingOrder}
                  className="flex-1 py-4 bg-[var(--brand-dark-text)] hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:bg-gray-400 cursor-pointer"
                >
                  {updatingOrder ? 'UPDATING...' : 'UPDATE ORDER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
