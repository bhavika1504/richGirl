import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Settings,
  Package,
  Heart,
  MapPin,
  CreditCard,
  LogOut,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: Package, label: 'My Orders', description: 'Track, return or buy things again', route: '/profile/orders' },
    { icon: Heart, label: 'Wishlist', description: 'Your favorite items saved', route: null },
    { icon: MapPin, label: 'Addresses', description: 'Save addresses for faster checkout', route: '/profile/addresses' },
    { icon: CreditCard, label: 'Payments', description: 'Manage your payment methods', route: null },
    { icon: Settings, label: 'Settings', description: 'Privacy and notifications', route: null },
  ];

  return (
    <div className="min-h-screen bg-[#F7FDF5] pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--brand-border)] lg:hidden"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
          </motion.button>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-headline)', color: 'var(--brand-dark-text)' }}>
            My Account
          </h1>
        </div>

        <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[var(--brand-border)] shadow-sm mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[var(--brand-mist-green)] rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              <UserIcon className="w-10 h-10 lg:w-12 lg:h-12 text-[var(--brand-cta-green)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}>
                Hello, {user?.name || 'Guest User'}
              </h2>
              <p className="text-gray-500 text-sm lg:text-base">{user?.email || 'Not logged in'}</p>
              <div className="flex gap-4 mt-2">
                <button className="text-xs font-bold text-[var(--brand-cta-green)] uppercase tracking-widest hover:underline">
                  Edit Profile
                </button>
                {user?.isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-xs font-bold text-purple-600 uppercase tracking-widest hover:underline"
                  >
                    Admin Dashboard →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (item.route) navigate(item.route);
                else alert(`${item.label} — coming soon!`);
              }}
              className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] flex items-center gap-4 text-left hover:border-[var(--brand-cta-green)] transition-all group cursor-pointer w-full"
              whileHover={{ x: 5 }}
            >
              <div className="w-12 h-12 bg-[var(--brand-alt-bg)] rounded-xl flex items-center justify-center text-[var(--brand-cta-green)] group-hover:bg-[var(--brand-mist-green)] transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--brand-dark-text)]" style={{ fontFamily: 'var(--font-body)' }}>{item.label}</h3>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </motion.button>
          ))}

          <motion.button
            className="mt-4 bg-red-50 p-5 rounded-2xl border border-red-100 flex items-center gap-4 text-left hover:bg-red-100 transition-all text-red-600 cursor-pointer"
            whileHover={{ x: 5 }}
            onClick={logout}
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Log Out</h3>
              <p className="text-xs opacity-70">Sign out of your account</p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-30" />
          </motion.button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
