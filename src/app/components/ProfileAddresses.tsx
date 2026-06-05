import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from './Navbar';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'motion/react';
import { INDIA_STATES, INDIA_STATES_CITIES } from '../data/indiaCities';

const emptyForm = { fullName: '', phone: '', street: '', city: '', state: '', zip: '', isDefault: false };

export function ProfileAddresses() {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);

    const availableCities = form.state ? (INDIA_STATES_CITIES[form.state] || []) : [];

    useEffect(() => {
        api.getAddresses().then(data => {
            setAddresses(data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleStateChange = (state: string) => {
        setForm(prev => ({ ...prev, state, city: '' }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await api.addAddress(form);
            setAddresses(updated);
            setShowForm(false);
            setForm({ ...emptyForm });
        } catch (err) {
            console.error('Failed to save address:', err);
            alert('Failed to save address. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this address?')) return;
        try {
            const updated = await api.deleteAddress(id);
            setAddresses(updated);
        } catch (err) {
            console.error('Failed to delete address:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7FDF5] pb-24">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/profile')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--brand-border)]">
                        <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
                    </button>
                    <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--brand-dark-text)' }}>
                        Saved Addresses
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand-cta-green)]" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.length === 0 && !showForm && (
                            <div className="text-center py-12 text-gray-400">
                                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                <p className="font-semibold">No saved addresses yet</p>
                                <p className="text-sm mt-1">Add one below for faster checkout!</p>
                            </div>
                        )}

                        {addresses.map((addr: any) => (
                            <motion.div key={addr._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white rounded-2xl border border-[var(--brand-border)] p-5 flex items-start gap-4 shadow-sm">
                                <div className="w-10 h-10 bg-[var(--brand-mist-green)] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-[var(--brand-cta-green)]" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-[var(--brand-dark-text)]">{addr.fullName}</p>
                                        {addr.isDefault && (
                                            <span className="text-[9px] bg-[var(--brand-cta-green)] text-white px-2 py-0.5 rounded-full uppercase font-bold">Default</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                                    <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                                </div>
                                <button onClick={() => handleDelete(addr._id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    title="Delete address">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}

                        {/* Add New Address Button */}
                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full py-5 border-2 border-dashed border-gray-200 rounded-2xl text-[var(--brand-cta-green)] font-bold hover:border-[var(--brand-cta-green)] hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> ADD NEW ADDRESS
                            </button>
                        ) : (
                            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSave}
                                className="bg-white rounded-3xl border border-[var(--brand-border)] p-6 space-y-4 shadow-sm">
                                <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-headline)' }}>New Address</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name *</label>
                                        <input required type="text" value={form.fullName}
                                            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                            placeholder="e.g. Priya Sharma"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm" />
                                    </div>
                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone *</label>
                                        <input required type="tel" pattern="[0-9]{10}" value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="10-digit mobile"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm" />
                                    </div>
                                    {/* Street */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Street Address *</label>
                                        <input required type="text" value={form.street}
                                            onChange={e => setForm(p => ({ ...p, street: e.target.value }))}
                                            placeholder="House No, Building, Street, Area"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm" />
                                    </div>
                                    {/* State Dropdown */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">State *</label>
                                        <select required value={form.state} onChange={e => handleStateChange(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm appearance-none cursor-pointer">
                                            <option value="">Select State</option>
                                            {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* City Dropdown (filtered by state) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">City *</label>
                                        {availableCities.length > 0 ? (
                                            <select required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm appearance-none cursor-pointer">
                                                <option value="">Select City</option>
                                                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" placeholder="Select a state first" disabled
                                                className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-400 cursor-not-allowed" />
                                        )}
                                    </div>
                                    {/* ZIP */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">PIN Code *</label>
                                        <input required type="text" pattern="[0-9]{6}" value={form.zip}
                                            onChange={e => setForm(p => ({ ...p, zip: e.target.value }))}
                                            placeholder="6-digit PIN"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--brand-cta-green)] transition-all text-sm" />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm cursor-pointer pt-1">
                                    <input type="checkbox" checked={form.isDefault}
                                        onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                                        className="accent-[var(--brand-cta-green)] w-4 h-4" />
                                    <span className="font-semibold text-gray-700">Set as default address</span>
                                </label>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowForm(false); setForm({ ...emptyForm }); }}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all">
                                        CANCEL
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="flex-1 py-3 bg-[var(--brand-dark-text)] text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-60">
                                        {saving ? 'SAVING...' : 'SAVE ADDRESS'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
