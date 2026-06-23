import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ArrowLeft, User, Phone, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP } = useAuth();

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await requestOTP(formData.phone);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyOTP(
        formData.phone,
        otpCode,
        formData.name,
        formData.email
      );

      setSuccess('Registraton successful!');
      setTimeout(() => {
        if (data.user?.isAdmin) navigate('/admin');
        else navigate('/');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code');
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
              Join Us
            </h1>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-gray-500 text-sm"
            >
              Verify your mobile to create a secure account
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.form
                key="details-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
                onSubmit={handleRequestOTP}
              >
                {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full h-12 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-black/10 mt-6 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Verify'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="verify-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
                onSubmit={handleVerifyRegistration}
              >
                {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl text-center font-medium border border-emerald-100">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--brand-dark-text)] ml-1 uppercase tracking-widest">Enter Verification Code</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all text-center text-xl font-bold tracking-[8px]"
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-gray-400">Verifying {formData.phone}</p>
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-[10px] font-bold text-[var(--brand-cta-green)] uppercase hover:underline"
                    >
                      Edit Info
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || success !== ''}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 bg-[var(--brand-cta-green)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-900/10 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--brand-dark-text)] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
