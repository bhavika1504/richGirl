import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ArrowLeft, Chrome, Loader2, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, requestOTP, verifyOTP } = useAuth();

  // States
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestOTP(phone);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyOTP(phone, otpCode);
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else if (data.user?.role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else if (data.user?.role === 'employee') {
        navigate('/employee');
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
          <div className="text-center mb-8">
            <h1
              style={{ fontFamily: 'var(--font-headline)' }}
              className="text-4xl font-bold text-[var(--brand-dark-text)] mb-2"
            >
              RichGirl
            </h1>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-gray-500 text-sm"
            >
              Sign in to your premium account
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex bg-[var(--brand-alt-bg)] p-1.5 rounded-2xl mb-8 border border-[var(--brand-border)]">
            <button
              onClick={() => { setAuthMethod('phone'); setError(''); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${authMethod === 'phone'
                ? 'bg-white text-[var(--brand-dark-text)] shadow-sm'
                : 'text-gray-400'
                }`}
            >
              Phone (OTP)
            </button>
            <button
              onClick={() => { setAuthMethod('email'); setError(''); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${authMethod === 'email'
                ? 'bg-white text-[var(--brand-dark-text)] shadow-sm'
                : 'text-gray-400'
                }`}
            >
              Email (Password)
            </button>
          </div>

          <form className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {authMethod === 'phone' ? (
                <motion.div
                  key="phone-auth"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {step === 'request' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all font-medium"
                          placeholder="9876543210"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 ml-1">We will send a 6-digit code via WhatsApp</p>

                      <motion.button
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-black/10 mt-6 flex items-center justify-center gap-2"
                        style={{ fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Verification Code'}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Enter Verification Code</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all text-center text-xl font-bold tracking-[8px]"
                            placeholder="000000"
                          />
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] text-gray-400">Sent to +91 {phone}</p>
                          <button
                            type="button"
                            onClick={() => setStep('request')}
                            className="text-[10px] font-bold text-[var(--brand-cta-green)] uppercase hover:underline"
                          >
                            Change Number
                          </button>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-[var(--brand-cta-green)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-900/10 flex items-center justify-center gap-2"
                        style={{ fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="email-auth"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Email Address</label>
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
                      <label className="text-[10px] font-bold text-[var(--brand-dark-text)] uppercase tracking-widest">Password</label>
                      <Link to="/forgot-password" className="text-[10px] text-[var(--brand-cta-green)] font-bold hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleEmailLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-black/10 mt-4 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In with Password'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-white px-4 text-gray-400 font-bold">New to RichGirl?</span>
            </div>
          </div>

          <Link
            to="/register"
            className="w-full h-14 border-2 border-[var(--brand-border)] rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-bold text-[var(--brand-dark-text)] uppercase text-xs tracking-widest"
          >
            Create Your Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
