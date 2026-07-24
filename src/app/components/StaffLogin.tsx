import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function StaffLogin() {
  const navigate = useNavigate();
  const { login, requestOTP, verifyOTP } = useAuth();

  // Mode: Admin vs Employee selection
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee'>('admin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'request' | 'verify'>('request');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const userRole = data.user?.role || (data.user?.isAdmin ? 'admin' : 'customer');

      if (userRole === 'customer') {
        setError('Access Denied: Customer accounts cannot access the Staff Portal.');
        return;
      }

      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'employee') {
        navigate('/employee');
      } else {
        setError('Unauthorized staff role');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or staff authorization error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit registered staff mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestOTP(phone);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP to registered staff number');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await verifyOTP(phone, otpCode);
      const userRole = data.user?.role || (data.user?.isAdmin ? 'admin' : 'customer');

      if (userRole === 'customer') {
        setError('Access Denied: Customer accounts cannot access the Staff Portal.');
        return;
      }

      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'employee') {
        navigate('/employee');
      } else {
        setError('Unauthorized staff role');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col items-center justify-center p-4 lg:p-6 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#1B3B2B_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md border border-[var(--brand-border)] z-50 hover:bg-emerald-50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Return to Main Store"
      >
        <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-2xl shadow-emerald-950/10 border border-emerald-900/10 relative">
          
          {/* Header Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-[var(--brand-dark-text)] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-cta-green)]" />
              Restricted Staff Access
            </span>
          </div>

          <div className="text-center mb-6">
            <h1
              style={{ fontFamily: 'var(--font-headline)' }}
              className="text-3xl lg:text-4xl font-bold text-[var(--brand-dark-text)] mb-1"
            >
              RichGirl Portal
            </h1>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-gray-500 text-xs lg:text-sm font-medium"
            >
              Management & Staff Verification
            </p>
          </div>

          {/* Role Tabs: Admin vs Employee */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl mb-6 border border-gray-200">
            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-[var(--brand-dark-text)] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('employee'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'employee'
                  ? 'bg-[var(--brand-dark-text)] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Employee Portal
            </button>
          </div>

          {/* Auth Method Sub-Toggle */}
          <div className="flex justify-center gap-4 mb-6 border-b border-gray-100 pb-3">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setError(''); setStep('request'); }}
              className={`text-xs font-semibold pb-1 transition-all ${
                authMethod === 'email'
                  ? 'text-[var(--brand-cta-green)] border-b-2 border-[var(--brand-cta-green)] font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setError(''); setStep('request'); }}
              className={`text-xs font-semibold pb-1 transition-all ${
                authMethod === 'phone'
                  ? 'text-[var(--brand-cta-green)] border-b-2 border-[var(--brand-cta-green)] font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Mobile OTP
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 mb-6 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {authMethod === 'email' ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleEmailLogin}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/30 focus:border-[var(--brand-cta-green)] transition-all"
                      placeholder={selectedRole === 'admin' ? "admin@richgirl.com" : "employee@richgirl.com"}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">
                    Staff Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-11 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/30 focus:border-[var(--brand-cta-green)] transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-13 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/10 mt-4 flex items-center justify-center gap-2"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Authenticate as ${selectedRole === 'admin' ? 'Admin' : 'Employee'}`
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="phone-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {step === 'request' ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">
                        Registered Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl pl-13 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/30 focus:border-[var(--brand-cta-green)] transition-all"
                          placeholder="9876543210"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 ml-1">Staff verification OTP will be sent via WhatsApp</p>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-13 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/10 mt-4 flex items-center justify-center gap-2"
                      style={{ opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Staff OTP'}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">
                        Enter 6-Digit Staff OTP
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 text-center text-lg font-bold tracking-[6px] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/30 focus:border-[var(--brand-cta-green)] transition-all"
                          placeholder="000000"
                          required
                        />
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-gray-400">Sent to +91 {phone}</p>
                        <button
                          type="button"
                          onClick={() => setStep('request')}
                          className="text-[10px] font-bold text-[var(--brand-cta-green)] hover:underline uppercase"
                        >
                          Change Number
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-13 bg-[var(--brand-cta-green)] text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-950/10 flex items-center justify-center gap-2"
                      style={{ opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Access Staff Dashboard'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              Authorized personnel only. Unauthenticated login attempts are logged for security.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
