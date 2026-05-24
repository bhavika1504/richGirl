import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, Chrome, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot';

export default function AuthPromptModal({ isOpen, onClose }: AuthPromptModalProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, phone, password);
      setSuccess('Registration successful! Please check console for verification link.');
      setTimeout(() => {
        setView('login');
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Inline password reset request (we will build this endpoint)
      const { api } = await import('../services/api');
      await api.forgotPassword(email);
      setSuccess('Reset link generated! Please check console.');
      setTimeout(() => {
        setView('login');
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    // In a production app, this would redirect to OAuth flow.
    // Let's simulate/warn the user or redirect.
    alert('Google login simulation: Redirecting to mock Google auth flow.');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-[var(--brand-border)] z-10 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--brand-mist-green)] text-[var(--brand-dark-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2
              style={{ fontFamily: 'var(--font-headline)' }}
              className="text-3xl font-extrabold text-[var(--brand-dark-text)]"
            >
              {view === 'login' && 'Welcome Back'}
              {view === 'register' && 'Create Account'}
              {view === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>
              {view === 'login' && 'Sign in to access your premium features'}
              {view === 'register' && 'Register now to start shopping'}
              {view === 'forgot' && 'Enter your email to request a reset link'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-[var(--brand-dark-text)] text-xs font-semibold rounded-xl text-center">
              {success}
            </div>
          )}

          {/* Views */}
          <div style={{ fontFamily: 'var(--font-body)' }}>
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)] ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)]">Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[10px] text-[var(--brand-cta-green)] font-bold hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--brand-dark-text)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 text-sm shadow-md"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </button>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)] ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-11 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)] ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)] ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99999 99999"
                      className="w-full h-11 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)] ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[var(--brand-dark-text)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-3 text-sm shadow-md"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Now'}
                </button>
              </form>
            )}

            {view === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-dark-text)] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 pl-11 pr-4 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--brand-dark-text)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 text-sm shadow-md"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full text-center text-xs text-[var(--brand-dark-text)] font-semibold hover:underline mt-2 flex items-center justify-center gap-1"
                >
                  Back to Login
                </button>
              </form>
            )}

            {/* Google / Alternative Auth Options */}
            {view !== 'forgot' && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-gray-400 font-bold">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleClick}
                  className="w-full h-11 border border-[var(--brand-border)] rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-semibold text-gray-600 text-sm"
                >
                  <Chrome className="w-4 h-4" />
                  Google
                </button>
              </>
            )}

            {/* View Switcher Footer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              {view === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setView('register')}
                    className="text-[var(--brand-cta-green)] font-extrabold hover:underline"
                  >
                    Register Now
                  </button>
                </>
              ) : (
                view === 'register' && (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setView('login')}
                      className="text-[var(--brand-cta-green)] font-extrabold hover:underline"
                    >
                      Login Here
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
