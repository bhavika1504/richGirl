import { useState, useEffect, Fragment } from 'react';
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
  Menu,
  X,
  Upload,
  ExternalLink,
  BarChart3,
  Trash2,
  PieChart as PieChartIcon,
  FileText,
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link, useNavigate } from 'react-router';
import { api } from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const STANDARD_COLORS = [
  'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Beige', 'Maroon', 'Grey', 'Multi'
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const STATUS_COLORS: Record<string, string> = {
    Processing: 'bg-yellow-50 text-yellow-600',
    Confirmed: 'bg-blue-50 text-blue-600',
    Shipped: 'bg-indigo-50 text-indigo-600',
    'Out for Delivery': 'bg-orange-50 text-orange-600',
    Delivered: 'bg-green-50 text-green-600',
    Cancelled: 'bg-red-50 text-red-600',
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'configurations' | 'reports'>('overview');
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Update Order Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // User management states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee' as 'admin' | 'employee' | 'customer'
  });
  const [submittingUser, setSubmittingUser] = useState(false);

  // Shiprocket states
  const [exportingShiprocket, setExportingShiprocket] = useState(false);
  const [importingShiprocket, setImportingShiprocket] = useState(false);

  const handleExportShiprocket = async () => {
    setExportingShiprocket(true);
    try {
      const blob = await api.exportShiprocketOrders();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `shiprocket_orders_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Export failed:', err);
      let errorMsg = 'Export failed. Please check if you have pending orders.';

      // If responseType is 'blob', axios includes the error JSON inside the blob
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string);
            alert(`EXPORT ERROR: ${data.message || errorMsg}`);
          } catch (e) {
            alert(errorMsg);
          }
        };
        reader.readAsText(err.response.data);
      } else {
        alert(err.response?.data?.message || errorMsg);
      }
    } finally {
      setExportingShiprocket(false);
    }
  };

  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    const brandName = "RICH GIRL";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(brandName, 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Ethnic & Western Fusion", 20, 32);

    doc.setFontSize(16);
    doc.text("INVOICE", 150, 25);

    doc.setFontSize(10);
    doc.text(`Order ID: ${order.orderId}`, 150, 32);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 38);

    // Billing / Shipping
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(order.shippingAddress?.fullName || 'Customer', 20, 62);
    doc.text(order.shippingAddress?.street || '', 20, 68);
    doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.zip}`, 20, 74);
    doc.text(`Phone: ${order.shippingAddress?.phone || ''}`, 20, 80);

    // Table
    const tableData = order.products.map((item: any) => [
      item.name,
      `${item.size} / ${item.color}`,
      item.quantity,
      `INR ${item.priceAtTimeOfPurchase.toLocaleString()}`,
      `INR ${(item.quantity * item.priceAtTimeOfPurchase).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Product', 'Size/Color', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`INR ${(order.totalAmount - (order.deliveryCharge || 0) + (order.discount || 0)).toLocaleString()}`, 175, finalY, { align: 'right' });

    doc.text(`Delivery Charge:`, 140, finalY + 7);
    doc.text(`INR ${(order.deliveryCharge || 0).toLocaleString()}`, 175, finalY + 7, { align: 'right' });

    doc.text(`Discount:`, 140, finalY + 14);
    doc.text(`- INR ${(order.discount || 0).toLocaleString()}`, 175, finalY + 14, { align: 'right' });

    doc.setFontSize(14);
    doc.text(`Total Paid:`, 140, finalY + 25);
    doc.text(`INR ${(order.totalAmount || 0).toLocaleString()}`, 175, finalY + 25, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for shopping with Rich Girl!", 105, finalY + 45, { align: 'center' });

    doc.save(`invoice_${order.orderId}.pdf`);
  };

  const handleImportShiprocket = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingShiprocket(true);
    try {
      const res = await api.importShiprocketReport(file);
      alert(`IMPORT COMPLETE!\n✅ Success: ${res.successCount}\n❌ Failures: ${res.errors.length}\n\n${res.errors.join('\n')}`);
      reloadData();
    } catch (err: any) {
      console.error('Import failed:', err);
      alert(`Import failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setImportingShiprocket(false);
      e.target.value = '';
    }
  };

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
      setProducts(Array.isArray(productsData) ? productsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setDbStats(statsData || { totalProducts: 0, lowStock: 0, activeOrders: 0, totalRevenue: 0 });
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEmployee && activeTab !== 'products') {
      setActiveTab('products');
    }
    reloadData();
  }, [user]);

  const handleGenerateAI = async () => {
    if (imagePreviews.length === 0) {
      alert('Please upload/select an image first');
      return;
    }
    setGeneratingAI(true);
    try {
      let currentImageUrl = imagePreviews[0];

      // If the first image is a local blob (new file), upload it first
      if (currentImageUrl.startsWith('blob:') && imageFiles.length > 0) {
        const config = await api.getConfig();
        const formData = new FormData();
        formData.append('file', imageFiles[0]);
        formData.append('upload_preset', config.cloudinaryUploadPreset);
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
          formData
        );
        currentImageUrl = res.data.secure_url;
      }

      const res = await api.generateDescription(currentImageUrl);
      setNewProduct({ ...newProduct, description: res.description });
    } catch (error: any) {
      console.error('AI generation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`AI generation failed: ${errorMsg}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (imageFiles.length + newFiles.length > 5) {
        alert('Maximum 5 images allowed per product');
        return;
      }
      setImageFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    setImagePreviews(product.images || (product.image ? [product.image] : []));
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
      const finalImageUrls = [...imagePreviews.filter(p => !p.startsWith('blob:'))];

      if (imageFiles.length > 0) {
        const config = await api.getConfig();
        const uploadPromises = imageFiles.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', config.cloudinaryUploadPreset);
          return axios.post(
            `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
            formData
          );
        });

        const uploadResults = await Promise.all(uploadPromises);
        uploadResults.forEach(res => finalImageUrls.push(res.data.secure_url));
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
        images: finalImageUrls,
        image: finalImageUrls[0] || '', // Keep legacy 'image' for safety
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
    setImageFiles([]);
    setImagePreviews([]);
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

  const handleOpenAddUserModal = () => {
    setNewUser({ name: '', email: '', phone: '', password: '', role: 'employee' });
    setIsEditingUser(false);
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setNewUser({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      password: '', // Don't show password
      role: user.role || (user.isAdmin ? 'admin' : 'customer')
    });
    setIsEditingUser(true);
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteAdminUser(userId);
      reloadData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user');
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      if (isEditingUser && selectedUser) {
        await api.updateAdminUser(selectedUser.id || selectedUser._id, newUser);
      } else {
        await api.createAdminUser(newUser);
      }
      setIsUserModalOpen(false);
      reloadData();
    } catch (err: any) {
      console.error('Failed to submit user:', err);
      alert(`FAILED TO SUBMIT USER: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingUser(false);
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${dbStats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: dbStats.activeOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Products', value: dbStats.totalProducts.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock', value: dbStats.lowStock.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  // Analytics Data Preparation
  const getDailyRevenue = () => {
    const revenueMap: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    last7Days.forEach(date => revenueMap[date] = 0);

    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (revenueMap[date] !== undefined) {
        revenueMap[date] += order.totalAmount || 0;
      }
    });

    return Object.entries(revenueMap).map(([date, revenue]) => ({
      date: date.split('/')[0] + '/' + date.split('/')[1],
      revenue
    }));
  };

  const getOrderStatusData = () => {
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      const status = order.shippingStatus || 'Processing';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const getCategoryData = () => {
    const catMap: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.categoryName || p.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex pb-20 lg:pb-0">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/richgirl_logo.png"
              alt="RICH GIRL"
              className="h-22 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'reports', label: 'Reports', icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
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

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex lg:hidden z-40 safe-area-pb">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === item.id
              ? 'text-[var(--brand-cta-green)]'
              : 'text-gray-400'
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-headline)' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>Manage your store's inventory and orders</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-cta-green)] transition-all"
              />
            </div>
            {activeTab === 'users' && (
              <button
                onClick={handleOpenAddUserModal}
                className="flex items-center justify-center gap-2 bg-[var(--brand-cta-green)] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#10B981]/20 cursor-pointer text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">ADD EMPLOYEE</span>
                <span className="sm:hidden">ADD</span>
              </button>
            )}
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 bg-[var(--brand-cta-green)] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#10B981]/20 cursor-pointer text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">ADD PRODUCT</span>
                <span className="sm:hidden">ADD</span>
              </button>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        {!isEmployee && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`${stat.bg} ${stat.color} p-2 md:p-3 rounded-xl md:rounded-2xl`}>
                    <stat.icon className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] md:text-sm font-medium mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
                <h4 className="text-lg md:text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-price)' }}>{stat.value}</h4>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Content Section */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] md:min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="p-4 md:p-8 space-y-6 md:space-y-10">
              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Revenue Chart */}
                <div className="bg-gray-50/30 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-green-500" /> Revenue (Last 7 Days)
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Daily sales performance tracking</p>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">LIVE</div>
                  </div>
                  <div className="h-48 md:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDailyRevenue()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#F9FAFB' }}
                        />
                        <Bar dataKey="revenue" fill="var(--brand-cta-green)" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders Status Pie */}
                <div className="bg-gray-50/30 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                        <PieChartIcon className="w-5 h-5 text-blue-500" /> Order Distribution
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Status breakdown for all orders</p>
                    </div>
                  </div>
                  <div className="h-56 md:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getOrderStatusData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {getOrderStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Top Categories */}
                <div className="lg:col-span-2 bg-gray-50/30 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2 text-lg">
                    <ShoppingBag className="w-5 h-5 text-purple-500" /> Catalog Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {getCategoryData().map((cat, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">
                          <span>{cat.name}</span>
                          <span className="text-gray-900">{cat.value} items</span>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.value / (products.length || 1)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[var(--brand-cta-green)] to-[#86EFAC]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts / Tasks */}
                <div className="space-y-6">
                  {dbStats.lowStock > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">Restock Required</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-6">{dbStats.lowStock} products have reached critical stock levels.</p>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="w-full py-3 bg-white text-red-500 border border-red-100 rounded-xl font-bold text-xs hover:bg-red-100 transition-all cursor-pointer shadow-sm"
                      >
                        MANAGE INVENTORY
                      </button>
                    </div>
                  )}

                  <div className="bg-[var(--brand-dark-text)] border border-black rounded-3xl p-6 text-white overflow-hidden relative">
                    <div className="relative z-10">
                      <h4 className="font-bold mb-2">Advanced Analytics</h4>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-6">Unlock deeper insights into customer behavior and seasonal trends.</p>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-all tracking-widest cursor-pointer">
                        View Full Report
                      </button>
                    </div>
                    <BarChart3 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'overview' && (
            <Fragment>
              <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Recent {activeTab}</h3>
                {activeTab === 'orders' && (
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide flex-1">
                      {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                        <button
                          key={status}
                          onClick={() => setOrderStatusFilter(status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${orderStatusFilter === status
                            ? 'bg-[var(--brand-cta-green)] text-white border-transparent'
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {!isEmployee && (
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={handleExportShiprocket}
                          disabled={exportingShiprocket}
                          title="Export Today's Orders for Shiprocket"
                          className="flex items-center gap-2 bg-[var(--brand-dark-text)] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm active:scale-95 disabled:bg-gray-300"
                        >
                          <Package className="w-3.5 h-3.5" />
                          {exportingShiprocket ? 'EXPORTING...' : 'Shiprocket Export'}
                        </button>

                        <label className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm cursor-pointer active:scale-95">
                          <Upload className="w-3.5 h-3.5" />
                          {importingShiprocket ? 'IMPORTING...' : 'Import Track IDs'}
                          <input
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={handleImportShiprocket}
                            disabled={importingShiprocket}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
                <button className="text-sm font-bold text-[var(--brand-cta-green)] flex items-center gap-1 hover:underline hidden md:flex">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                {activeTab === 'products' && (
                  <>
                    {/* Desktop Table */}
                    <table className="w-full text-left hidden md:table">
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
                        {Array.isArray(products) && products
                          .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
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
                                  <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                                    {product.inStock ? product.stock : '0'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.inStock ? (product.stock <= 5 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600') : 'bg-red-50 text-red-600'}`}>
                                  {product.inStock ? (product.stock <= 5 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
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
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-50">
                      {Array.isArray(products) && products
                        .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((product) => (
                          <div key={product.id} className="p-4 flex items-center gap-3">
                            <div className="w-14 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={product.image || (product.images?.[0])} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                              <p className="text-[11px] text-gray-500 capitalize">{product.categoryName || product.category}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-gray-900">₹{(product.price || 0).toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${product.inStock ? (product.stock <= 5 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600') : 'bg-red-50 text-red-600'}`}>
                                  {product.inStock ? (product.stock <= 5 ? 'Low' : `${product.stock} pcs`) : 'OOS'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleEditProduct(product)} className="p-2 bg-blue-50 rounded-lg text-blue-600"><Package className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(product.id || product._id)} className="p-2 bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
                {activeTab === 'orders' && (
                  <>
                    {/* Desktop Table */}
                    <table className="w-full text-left hidden md:table">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {Array.isArray(orders) && orders
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
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDownloadInvoice(order)}
                                  className="inline-flex items-center gap-1 text-[var(--brand-cta-green)] text-xs font-bold hover:underline cursor-pointer bg-[var(--brand-alt-bg)] px-3 py-1.5 rounded-lg transition-all hover:bg-[var(--brand-mist-green)] mr-2"
                                >
                                  Invoice <Download className="w-3 h-3" />
                                </button>
                                <Link
                                  to={`/admin/orders/${order.id || order._id}`}
                                  className="inline-flex items-center gap-1 text-[var(--brand-cta-green)] text-xs font-bold hover:underline cursor-pointer bg-[var(--brand-alt-bg)] px-3 py-1.5 rounded-lg transition-all hover:bg-[var(--brand-mist-green)]"
                                >
                                  Manage <ExternalLink className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-50">
                      {Array.isArray(orders) && orders
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
                          <div key={order.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-900 text-sm">{order.orderId}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.shippingStatus] || 'bg-gray-50 text-gray-500'}`}>
                                {order.shippingStatus || 'Processing'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600">{order.userName}</p>
                                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</span>
                                <button
                                  onClick={() => handleDownloadInvoice(order)}
                                  className="p-2 bg-[var(--brand-alt-bg)] rounded-lg text-[var(--brand-cta-green)]"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <Link
                                  to={`/admin/orders/${order.id || order._id}`}
                                  className="p-2 bg-[var(--brand-alt-bg)] rounded-lg text-[var(--brand-cta-green)]"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    {/* Desktop Table */}
                    <table className="w-full text-left hidden md:table">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {Array.isArray(users) && users
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
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' || user.isAdmin ? 'bg-purple-50 text-purple-600' :
                                  user.role === 'employee' ? 'bg-blue-50 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                  {user.role === 'admin' || user.isAdmin ? 'Admin' :
                                    user.role === 'employee' ? 'Employee' : 'Customer'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"
                                  >
                                    <Plus className="w-4 h-4 rotate-45" /> {/* Use Plus as edit for now or similar icon */}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id || user._id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-50">
                      {Array.isArray(users) && users
                        .filter(u => !searchQuery ||
                          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((user) => (
                          <div key={user.id} className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-gray-600">{user.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-[11px] text-gray-500 truncate">{user.email || user.phone}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${user.role === 'admin' || user.isAdmin ? 'bg-purple-50 text-purple-600' : user.role === 'employee' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                              {user.role === 'admin' || user.isAdmin ? 'Admin' : user.role === 'employee' ? 'Employee' : 'Customer'}
                            </span>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleEditUser(user)} className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                <Plus className="w-3 h-3 rotate-45" />
                              </button>
                              <button onClick={() => handleDeleteUser(user.id || user._id)} className="p-1.5 bg-red-50 rounded-lg text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-gray-900">Order Invoices</h3>
                            <p className="text-xs text-gray-500 mt-1">Download official PDF invoices for customer orders.</p>
                          </div>
                          <FileText className="w-5 h-5 text-[var(--brand-cta-green)]" />
                        </div>

                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                          {orders.length > 0 ? orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{order.orderId}</p>
                                <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount?.toLocaleString()}</p>
                              </div>
                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex-shrink-0"
                              >
                                <Download className="w-3 h-3 text-[var(--brand-cta-green)]" />
                                PDF
                              </button>
                            </div>
                          )) : (
                            <div className="text-center py-10">
                              <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                              <p className="text-xs text-gray-400 font-bold">No orders found</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-gray-900">Revenue Metrics</h3>
                            <p className="text-xs text-gray-500 mt-1">Weekly performance overview.</p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-h-[250px] flex items-end">
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={getDailyRevenue()}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} hide />
                              <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontWeight: 'bold', color: '#10B981' }}
                              />
                              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
                            <p className="text-lg font-bold text-gray-900">₹{dbStats.totalRevenue?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Orders</p>
                            <p className="text-lg font-bold text-[var(--brand-cta-green)]">{dbStats.activeOrders}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          )}
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
                    disabled={generatingAI || imagePreviews.length === 0}
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Images (Up to 5) *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center font-bold">
                          MAIN IMAGE
                        </div>
                      )}
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <div className="relative aspect-[3/4] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={imagePreviews.length === 0}
                      />
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[var(--brand-cta-green)] shadow-sm mb-2">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Image</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">First image will be used as the primary display image. (Max 5 images)</p>
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

      {/* USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 p-8 relative">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-gray-700" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
              {isEditingUser ? 'Edit User' : 'Add New Employee'}
            </h3>

            <form onSubmit={handleUserSubmit} className="space-y-5" style={{ fontFamily: 'var(--font-body)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm font-bold"
                  >
                    <option value="customer">Customer</option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                <input
                  type="text"
                  required
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm"
                  placeholder="Phone Number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{isEditingUser ? 'New Password (Optional)' : 'Password *'}</label>
                <input
                  type="password"
                  required={!isEditingUser}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="flex-1 py-4 bg-[var(--brand-cta-green)] hover:scale-[1.02] text-white rounded-2xl font-bold transition-all active:scale-[0.98] disabled:bg-gray-400 cursor-pointer"
                >
                  {submittingUser ? 'SAVING...' : (isEditingUser ? 'UPDATE USER' : 'CREATE ACCOUNT')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
