import { useState, useEffect, Fragment } from 'react';
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Package,
    LogOut,
    ChevronRight,
    TrendingUp,
    Image as ImageIcon,
    Check,
    X,
    PlusCircle,
    Sparkles,
    RefreshCw,
    Box,
    Tags,
    IndianRupee,
    Smartphone,
    ChevronDown,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router';

const STANDARD_COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Grey', 'Beige', 'Gold', 'Silver', 'Navy', 'Maroon', 'Teal', 'Lavender', 'Peach', 'Mint', 'Turquoise', 'Other'];

export function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [generatingAI, setGeneratingAI] = useState(false);

    // Form States
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        discount: '0',
        category: '',
        type: 'indian',
        sizes: [{ size: '', variants: [{ color: '', colorLabel: '', stock: 0 }] }],
        images: [] as File[]
    });
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                api.getProducts(),
                api.getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setNewProduct(prev => ({ ...prev, images: [...prev.images, ...files] }));
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setNewProduct(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const calculateNetPrice = () => {
        const mrp = Number(newProduct.price) || 0;
        const discount = Number(newProduct.discount) || 0;
        return Math.round(mrp * (1 - discount / 100));
    };

    const handleGenerateAI = async () => {
        if (!newProduct.name) {
            alert('Please enter a product name first!');
            return;
        }
        setGeneratingAI(true);
        try {
            const prompt = `Write a high-end, poetic, and premium e-commerce description for a luxury ethnic wear product named "${newProduct.name}". Include a few bullet points about the fabric, occasion, and styling tips. Keep it under 150 words.`;
            const description = await api.generateAIDescription(prompt);
            setNewProduct(prev => ({ ...prev, description }));
        } catch (err) {
            console.error('AI generation failed:', err);
            alert('Failed to generate description. Please try again.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price);
            formData.append('discount', newProduct.discount);
            formData.append('category', newProduct.category);
            formData.append('type', newProduct.type);
            formData.append('sizes', JSON.stringify(newProduct.sizes));
            newProduct.images.forEach(img => formData.append('images', img));

            await api.createProduct(formData);
            setIsAddModalOpen(false);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Failed to add product:', err);
            alert('Failed to create product. Check all fields.');
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price);
            formData.append('discount', newProduct.discount);
            formData.append('category', newProduct.category);
            formData.append('type', newProduct.type);
            formData.append('sizes', JSON.stringify(newProduct.sizes));
            if (newProduct.images.length > 0) {
                newProduct.images.forEach(img => formData.append('images', img));
            }

            await api.updateProduct(editingProduct._id || editingProduct.id, formData);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Failed to update product:', err);
            alert('Update failed.');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Delete this product? This action cannot be undone.')) {
            try {
                await api.deleteProduct(id);
                fetchData();
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    const resetForm = () => {
        setNewProduct({
            name: '',
            description: '',
            price: '',
            discount: '0',
            category: '',
            type: 'indian',
            sizes: [{ size: '', variants: [{ color: '', colorLabel: '', stock: 0 }] }],
            images: []
        });
        setImagePreviews([]);
    };

    const startEditProduct = (product: any) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            discount: (product.discount || 0).toString(),
            category: product.category,
            type: product.type || 'indian',
            sizes: product.sizes || [{ size: '', variants: [{ color: '', colorLabel: '', stock: 0 }] }],
            images: []
        });
        // For editing, we don't preview existing images in this simple version yet,
        // but we could map product.images to imagePreviews if needed.
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[var(--brand-cta-green)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAF8] flex flex-col lg:flex-row">
            {/* SIDEBAR - DESKTOP */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <img src="/assets/richgirl_logo.png" alt="RichGirl" className="h-14 w-auto object-contain" />
                    <div className="mt-4 p-4 bg-[var(--brand-alt-bg)] rounded-3xl">
                        <p className="text-[10px] font-bold text-[var(--brand-cta-green)] uppercase tracking-[0.2em] mb-1">Employee Panel</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-6 py-4 bg-[var(--brand-cta-green)] text-white rounded-[24px] shadow-lg shadow-emerald-900/10 transition-all font-bold text-sm">
                        <Package className="w-5 h-5" /> Products
                    </button>
                </nav>

                <div className="p-8 border-t border-gray-50">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 rounded-[20px] transition-all font-bold text-sm">
                        <LogOut className="w-5 h-5" /> Exit
                    </button>
                </div>
            </aside>

            {/* MOBILE HEADER */}
            <header className="lg:hidden bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-40">
                <img src="/assets/richgirl_logo.png" alt="RichGirl" className="h-10 w-auto" />
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 bg-gray-50 rounded-full font-bold text-xs">Shop</button>
                    <button onClick={logout} className="p-2 text-red-500"><LogOut className="w-5 h-5" /></button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    {/* Top Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>Product Management</h1>
                            <p className="text-gray-500 text-sm">Create, edit, and keep inventory up to date.</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                            className="flex items-center justify-center gap-2 bg-[var(--brand-cta-green)] text-white px-8 py-4 rounded-[24px] font-bold text-sm shadow-xl shadow-emerald-900/10 hover:translate-y-[-2px] transition-all"
                        >
                            <PlusCircle className="w-5 h-5" /> Add New Product
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 text-emerald-600 mb-3">
                                <Box className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Products</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                        </div>
                    </div>

                    {/* Catalog Controls */}
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full flex items-center">
                            <Search className="absolute left-6 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Find in catalog..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 pl-14 pr-6 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Products Table/Grid */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Product Details</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Price & Discount</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Stock Status</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products
                                        .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((product) => (
                                            <tr key={product.id} className="group hover:bg-gray-50/50 transition-all">
                                                <td className="px-8 py-6 flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                                        {product.images && product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm mb-1">{product.name}</p>
                                                        <div className="flex gap-2">
                                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">{product.category}</span>
                                                            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">{product.type}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600">{product.discount}% Off applied</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        {product.sizes?.map((sz: any) => (
                                                            <div key={sz.size} className="text-[10px] font-medium text-gray-500">
                                                                <span className="font-bold text-gray-900">{sz.size}:</span> {sz.variants?.reduce((sum: number, v: any) => sum + v.stock, 0)} units
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditProduct(product)} className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteProduct(product.id || product._id)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODALS - ADD / EDIT */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between p-8 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-headline)' }}>
                                    {isEditModalOpen ? 'Refine Product' : 'Curate New Product'}
                                </h2>
                                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-4 bg-gray-50 rounded-full hover:rotate-90 transition-all duration-300">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={isEditModalOpen ? handleUpdateProduct : handleAddProduct} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                                            <input
                                                type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-bold"
                                                placeholder="e.g. Silk Sequin Anarkali"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                                <button type="button" onClick={handleGenerateAI} disabled={generatingAI} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase hover:underline">
                                                    {generatingAI ? 'Writing...' : <><Sparkles className="w-3 h-3" /> Write with AI</>}
                                                </button>
                                            </div>
                                            <textarea
                                                required rows={4} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium resize-none"
                                                placeholder="Artisan craftsmanship meet modern silhouette..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                                <select
                                                    required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                    className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-bold appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select</option>
                                                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Heritage</label>
                                                <select
                                                    value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as any })}
                                                    className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-bold appearance-none cursor-pointer"
                                                >
                                                    <option value="indian">Indian Wear</option>
                                                    <option value="western">Western / Fusion</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pricing (MRP)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                    <input
                                                        type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                        className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-bold text-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sweeten (Disc %)</label>
                                                <input
                                                    type="number" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                                                    className="w-full bg-[#F8FAF8] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-bold text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Final Client Price</span>
                                            <span className="text-xl font-bold text-emerald-700">₹{calculateNetPrice().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Images Section */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Product Photography</label>
                                    <div className="flex flex-wrap gap-4">
                                        {imagePreviews.map((preview, i) => (
                                            <div key={i} className="relative group w-32 h-32 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                                                <img src={preview} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-32 h-32 bg-[#F8FAF8] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-600 uppercase tracking-tighter transition-colors">Add Photo</span>
                                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                {/* Inventory Management */}
                                <div className="mb-8 bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
                                    <div className="flex items-center justify-between mb-6">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Size & Stock Matrix</label>
                                        <button type="button" onClick={() => setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, { size: '', variants: [{ color: '', colorLabel: '', stock: 0 }] }] })} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase hover:underline">
                                            <PlusCircle className="w-4 h-4" /> Add Size Slot
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {newProduct.sizes.map((sz, szIdx) => (
                                            <div key={szIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 relative group/slot">
                                                <button type="button" onClick={() => {
                                                    const updated = newProduct.sizes.filter((_, i) => i !== szIdx);
                                                    setNewProduct({ ...newProduct, sizes: updated });
                                                }} className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-full shadow-lg border border-red-50 opacity-0 group-hover/slot:opacity-100 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="flex items-center gap-4 mb-4">
                                                    <select
                                                        value={sz.size} onChange={(e) => {
                                                            const updated = [...newProduct.sizes];
                                                            updated[szIdx].size = e.target.value;
                                                            setNewProduct({ ...newProduct, sizes: updated });
                                                        }}
                                                        className="w-40 bg-[#F8FAF8] border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-bold text-sm"
                                                    >
                                                        <option value="">Choose Size</option>
                                                        {['S', 'M', 'L', 'XL', 'XXL', 'Custom'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                    <button type="button" onClick={() => {
                                                        const updated = [...newProduct.sizes];
                                                        updated[szIdx].variants.push({ color: '', colorLabel: '', stock: 0 });
                                                        setNewProduct({ ...newProduct, sizes: updated });
                                                    }} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase">
                                                        <Plus className="w-3 h-3" /> Add Variant
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 border-l-2 border-gray-100 transition-all group-hover/slot:border-emerald-100">
                                                    {sz.variants.map((v, vIdx) => (
                                                        <div key={vIdx} className="flex flex-col gap-2 p-3 bg-gray-50/50 rounded-xl">
                                                            <select
                                                                required value={v.color} onChange={(e) => {
                                                                    const updated = [...newProduct.sizes];
                                                                    updated[szIdx].variants[vIdx].color = e.target.value;
                                                                    setNewProduct({ ...newProduct, sizes: updated });
                                                                }}
                                                                className="w-full bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold"
                                                            >
                                                                <option value="">Base Tone</option>
                                                                {STANDARD_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                            <input
                                                                type="text" placeholder="Detail (Butter Yellow)" value={v.colorLabel} onChange={(e) => {
                                                                    const updated = [...newProduct.sizes];
                                                                    updated[szIdx].variants[vIdx].colorLabel = e.target.value;
                                                                    setNewProduct({ ...newProduct, sizes: updated });
                                                                }}
                                                                className="w-full bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-medium"
                                                            />
                                                            <input
                                                                type="number" placeholder="Units" value={v.stock} onChange={(e) => {
                                                                    const updated = [...newProduct.sizes];
                                                                    updated[szIdx].variants[vIdx].stock = Number(e.target.value);
                                                                    setNewProduct({ ...newProduct, sizes: updated });
                                                                }}
                                                                className="w-full bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold text-emerald-700"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-white/80 backdrop-blur-md pt-4 pb-0 flex gap-4 mt-12 border-t border-gray-50">
                                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 py-5 rounded-[24px] font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                                    <button type="submit" className="flex-[2] py-5 bg-[var(--brand-cta-green)] text-white rounded-[24px] font-bold shadow-xl shadow-emerald-900/10 hover:translate-y-[-2px] transition-all">
                                        {isEditModalOpen ? 'Save Changes' : 'Confirm & Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
