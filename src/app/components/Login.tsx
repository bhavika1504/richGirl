import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ArrowLeft, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FDF5] flex flex-col items-center justify-center p-6">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--brand-border)] z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-xl shadow-green-900/5 border border-[var(--brand-border)]">
          <div className="text-center mb-10">
            <h1 
              style={{ fontFamily: 'var(--font-headline)' }}
              className="text-4xl font-bold text-[var(--brand-dark-text)] mb-2"
            >
              Welcome Back
            </h1>
            <p 
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-gray-500 text-sm"
            >
              Sign in to continue your premium shopping experience
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--brand-dark-text)] ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-[var(--brand-dark-text)] uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-[var(--brand-cta-green)] font-medium hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-black/10 mt-4 flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button className="w-full h-14 border border-[var(--brand-border)] rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <Chrome className="w-5 h-5" />
            Google
          </button>

          <p className="text-center mt-8 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--brand-cta-green)] font-bold hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
