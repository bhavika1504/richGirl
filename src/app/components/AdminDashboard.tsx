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
import { useAuth } from '../context/AuthContext';

const STANDARD_COLORS = [
  'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Beige', 'Maroon', 'Grey', 'Multi'
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const STATUS_COLORS: Record<string, string> = {
    Processing: 'bg-yellow-50 text-yellow-600',
    Confirmed: 'bg-blue-50 text-blue-600',
    Shipped: 'bg-indigo-50 text-indigo-600',
    'Out for Delivery': 'bg-orange-50 text-orange-600',
    Delivered: 'bg-green-50 text-green-600',
    Cancelled: 'bg-red-50 text-red-600',
  };

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>({ totalProducts: 0, lowStock: 0, activeOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Add Product Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '', // This will be MRP (originalPrice)
    discount: '0', // Percentage
    fabric: '',
    length: '',
    occasion: '',
    sizes: [
      {
        size: 'S',
        variants: [{ color: 'White', colorLabel: 'White', stock: 0 }]
      }
    ],
    type: 'western'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Update Order Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, usersData, statsData, catsData] = await Promise.all([
        api.getProducts(),
        api.getAllOrders(),
        api.getAllUsers(),
        api.getAdminStats(),
        api.getCategories()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setUsers(usersData);
      setDbStats(statsData);
      setCategories(catsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleGenerateAI = async () => {
    if (!imagePreview) {
      alert('Please upload an image first');
      return;
    }
    setGeneratingAI(true);
    try {
      // We need to upload the image first if it's not already uploaded, 
      // but the generate-description route expects a URL.
      // So we'll upload to Cloudinary first.
      let currentImageUrl = '';
      if (imageFile) {
        const config = await api.getConfig();
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', config.cloudinaryUploadPreset);
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
          formData
        );
        currentImageUrl = res.data.secure_url;
      }

      if (currentImageUrl) {
        const res = await api.generateDescription(currentImageUrl);
        setNewProduct({ ...newProduct, description: res.description });
      } else {
        alert('Upload failed or no image file selected.');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`AI generation failed: ${errorMsg}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAddModal = () => {
    resetProductForm();
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setIsEditing(true);
    setEditingProductId(product.id || product._id);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      category: product.categoryName || product.category,
      price: (product.originalPrice || product.price).toString(),
      discount: (product.discount || 0).toString(),
      fabric: product.fabric || '',
      length: product.length || '',
      occasion: product.occasion || '',
      sizes: product.sizes.map((s: any) => ({
        size: s.size,
        variants: s.variants.map((v: any) => ({
          color: v.color,
          colorLabel: v.colorLabel || v.color,
          stock: v.stock
        }))
      })),
      type: product.type || 'western'
    });
    setImagePreview(product.image || (product.images?.[0]) || '');
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      reloadData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        try {
          const config = await api.getConfig();
          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('upload_preset', config.cloudinaryUploadPreset);
          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
            formData
          );
          imageUrl = res.data.secure_url;
        } catch (uploadErr) {
          console.error('Cloudinary upload failed:', uploadErr);
        }
      }

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: Number(newProduct.price),
        discount: Number(newProduct.discount),
        fabric: newProduct.fabric,
        length: newProduct.length,
        occasion: newProduct.occasion,
        sizes: newProduct.sizes.map(s => ({
          size: s.size,
          variants: s.variants.map(v => ({
            color: v.color,
            colorLabel: v.colorLabel,
            stock: Number(v.stock)
          }))
        })),
        image: imageUrl,
        type: newProduct.type
      };

      if (isEditing && editingProductId) {
        await api.updateProduct(editingProductId, productData);
      } else {
        await api.createProduct(productData);
      }

      setIsAddModalOpen(false);
      resetProductForm();
      reloadData();
    } catch (err: any) {
      console.error('Failed to submit product:', err);
      alert(`FAILED TO SUBMIT PRODUCT: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const resetProductForm = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setNewProduct({
      name: '',
      description: '',
      category: '',
      price: '',
      discount: '0',
      fabric: '',
      length: '',
      occasion: '',
      sizes: [
        { size: 'S', variants: [{ color: 'White', colorLabel: 'White', stock: 0 }] }
      ],
      type: 'western'
    });
    setImageFile(null);
    setImagePreview('');
  };

  const calculateNetPrice = () => {
    const mrp = Number(newProduct.price) || 0;
    const disc = Number(newProduct.discount) || 0;
    return Math.round(mrp * (1 - disc / 100));
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
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
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium border-0 cursor-pointer"
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
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-cta-green)] transition-all w-64"
              />
            </div>
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddModal}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[var(--brand-cta-green)] text-white px-6 py-3 rounded-2xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#10B981]/20 cursor-pointer"
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
          <div className="p-6 border-b border-gray-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="font-bold text-gray-900">Recent {activeTab}</h3>

            {activeTab === 'orders' && (
              <div className="flex gap-2">
                {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${orderStatusFilter === status
                      ? 'bg-[var(--brand-cta-green)] text-white border-transparent'
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}

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
                  {products
                    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((product) => (
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
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.categoryName || product.category}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{(product.price || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: product.inStock ? '80%' : '20%' }} />
                            </div>
                            <span className="text-xs font-bold text-gray-600">{product.inStock ? 'Yes' : 'No'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all text-blue-600"
                              title="Edit Product"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id || product._id)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all text-red-600"
                              title="Delete Product"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
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
                  {orders
                    .filter(order => {
                      const matchesSearch = !searchQuery ||
                        (order.orderId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (order.userName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()));

                      const matchesStatus = orderStatusFilter === 'All' ||
                        (order.shippingStatus === orderStatusFilter);

                      return matchesSearch && matchesStatus;
                    })
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{order.orderId}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm">{order.userName}</p>
                          <p className="text-xs text-gray-500">{order.userEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.shippingStatus] || 'bg-gray-50 text-gray-500'}`}>
                            {order.shippingStatus || 'Processing'}
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
                  {users
                    .filter(u => !searchQuery ||
                      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isAdmin ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
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

            <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h3>

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
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.slug || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="other">Add New / Other...</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">Description</label>
                  <button
                    type="button"
                    disabled={generatingAI || !imagePreview}
                    onClick={handleGenerateAI}
                    className="text-xs font-bold text-[var(--brand-cta-green)] hover:underline flex items-center gap-1 disabled:text-gray-400 disabled:no-underline"
                  >
                    {generatingAI ? 'GENIAL GENERATING...' : '✨ GENERATE WITH AI'}
                  </button>
                </div>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium resize-none"
                  placeholder="Tell customers about the fabric, design, embroidery, fit, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (MRP) *</label>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                  <select
                    value={newProduct.discount}
                    onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="12">12%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                    <option value="30">30%</option>
                    <option value="50">50%</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-400 mb-2">Net Selling Price</label>
                  <div className="py-3 px-4 bg-gray-100 rounded-2xl text-sm font-bold text-gray-600">
                    ₹{calculateNetPrice().toLocaleString()}
                  </div>
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

              {/* Advanced Inventory Configuration */}
              <div className="mt-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-4">Size & Color Inventory Matrix</label>
                {newProduct.sizes.map((sz, szIdx) => (
                  <div key={szIdx} className="mb-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <select
                        required
                        value={['S', 'M', 'L', 'XL', 'XXL'].includes(sz.size) ? sz.size : (sz.size === '' ? '' : 'Other')}
                        onChange={(e) => {
                          const updated = [...newProduct.sizes];
                          updated[szIdx].size = e.target.value === 'Other' ? 'Custom' : e.target.value;
                          setNewProduct({ ...newProduct, sizes: updated });
                        }}
                        className="w-32 bg-white border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-[var(--brand-cta-green)] text-sm font-bold"
                      >
                        <option value="">Size</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="Other">Other...</option>
                      </select>

                      {(!['S', 'M', 'L', 'XL', 'XXL'].includes(sz.size) && sz.size !== '') && (
                        <input
                          type="text"
                          placeholder="e.g. 32, 4XL"
                          value={sz.size === 'Custom' ? '' : sz.size}
                          required
                          onChange={(e) => {
                            const updated = [...newProduct.sizes];
                            updated[szIdx].size = e.target.value;
                            setNewProduct({ ...newProduct, sizes: updated });
                          }}
                          className="w-24 bg-white border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-[var(--brand-cta-green)] text-sm"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newProduct.sizes.filter((_, i) => i !== szIdx);
                          setNewProduct({ ...newProduct, sizes: updated });
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove Size
                      </button>
                    </div>

                    <div className="ml-8 space-y-3">
                      {sz.variants.map((v, vIdx) => (
                        <div key={vIdx} className="flex items-center gap-3">
                          <select
                            required
                            value={v.color || ''}
                            onChange={(e) => {
                              const updated = [...newProduct.sizes];
                              updated[szIdx].variants[vIdx].color = e.target.value;
                              setNewProduct({ ...newProduct, sizes: updated });
                            }}
                            className="w-32 bg-white border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-[var(--brand-cta-green)] text-sm font-bold"
                          >
                            <option value="">Base Color</option>
                            {STANDARD_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input
                            type="text"
                            placeholder="Color Label (e.g. Butter Yellow)"
                            required
                            value={v.colorLabel || ''}
                            onChange={(e) => {
                              const updated = [...newProduct.sizes];
                              updated[szIdx].variants[vIdx].colorLabel = e.target.value;
                              setNewProduct({ ...newProduct, sizes: updated });
                            }}
                            className="flex-1 bg-white border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-[var(--brand-cta-green)] text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            required
                            min="0"
                            value={v.stock}
                            onChange={(e) => {
                              const updated = [...newProduct.sizes];
                              updated[szIdx].variants[vIdx].stock = Number(e.target.value);
                              setNewProduct({ ...newProduct, sizes: updated });
                            }}
                            className="w-24 bg-white border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-[var(--brand-cta-green)] text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...newProduct.sizes];
                              updated[szIdx].variants = updated[szIdx].variants.filter((_, i) => i !== vIdx);
                              setNewProduct({ ...newProduct, sizes: updated });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...newProduct.sizes];
                          updated[szIdx].variants.push({ color: 'White', colorLabel: 'White', stock: 0 });
                          setNewProduct({ ...newProduct, sizes: updated });
                        }}
                        className="text-xs font-bold text-[var(--brand-cta-green)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Color for {sz.size}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...newProduct.sizes, { size: '', variants: [{ color: 'White', colorLabel: 'White', stock: 0 }] }];
                    setNewProduct({ ...newProduct, sizes: updated });
                  }}
                  className="mt-4 flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Another Size
                </button>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Length</label>
                  <input
                    type="text"
                    value={newProduct.length}
                    onChange={(e) => setNewProduct({ ...newProduct, length: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                    placeholder="e.g. 42 inches, Knee Length"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Occasion</label>
                <input
                  type="text"
                  value={newProduct.occasion}
                  onChange={(e) => setNewProduct({ ...newProduct, occasion: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-medium"
                  placeholder="e.g. Casual, Festive, Wedding"
                />
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
