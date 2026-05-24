import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await api.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Your email has been verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed or link expired.');
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F7FDF5] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] p-8 lg:p-10 shadow-xl shadow-green-900/5 border border-[var(--brand-border)] text-center"
      >
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 bg-[var(--brand-mist-green)] rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-cta-green)]" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-pulse">
              <ShieldCheck className="w-10 h-10" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <ShieldAlert className="w-10 h-10" />
            </div>
          )}
        </div>

        <h1
          style={{ fontFamily: 'var(--font-headline)' }}
          className="text-3xl font-extrabold text-[var(--brand-dark-text)] mb-3"
        >
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p
          style={{ fontFamily: 'var(--font-body)' }}
          className="text-gray-500 text-sm mb-8 px-4"
        >
          {message || 'Please wait while we verify your email address...'}
        </p>

        {status !== 'loading' && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/login"
              className="w-full h-14 bg-[var(--brand-dark-text)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-black/10 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Go to Login <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
