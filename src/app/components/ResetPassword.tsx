import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing reset token in URL parameters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess('Password updated successfully! Redirecting you to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
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
              Reset Password
            </h1>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-gray-500 text-sm"
            >
              Set your new secure password below to regain access
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleResetSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 text-[var(--brand-dark-text)] text-sm rounded-xl text-center font-medium border border-emerald-100 animate-pulse">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--brand-dark-text)] ml-1 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-14 bg-[var(--brand-alt-bg)] border border-[var(--brand-border)] rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta-green)]/20 focus:border-[var(--brand-cta-green)] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--brand-dark-text)] ml-1 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            Back to{' '}
            <Link to="/login" className="text-[var(--brand-cta-green)] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
