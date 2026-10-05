/**
 * DiffRhythm 2 - User Authentication Modal
 * Signup, Login, Password Reset with Firebase
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { registerUser, loginUser, resetPassword } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const user = await loginUser(email, password);
        onSuccess(user);
        onClose();
      } else if (tab === 'signup') {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const user = await registerUser(email, password, displayName);
        onSuccess(user);
        onClose();
      } else if (tab === 'reset') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication error';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'An account with this email already exists.';
      } else if (msg.includes('invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Lock size={14} />
            <span>DiffRhythm 2 Cloud Access</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {tab === 'login' ? 'Sign In to Your Studio' : tab === 'signup' ? 'Create Studio Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {tab === 'login'
              ? 'Save your generated full-stack songs and cloud-sync your library.'
              : tab === 'signup'
              ? 'Join DiffRhythm 2 to save multi-track stems, custom lyrics, and presets.'
              : 'Enter your account email to receive a password reset link.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950/70 border border-zinc-800/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === 'login' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === 'signup' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('reset');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === 'reset' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/50 rounded-xl">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 rounded-xl">
            <CheckCircle size={15} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Producer Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CyberBeats"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@diffrhythm.ai"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {tab !== 'reset' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <span>
                  {tab === 'login' ? 'Sign In to Studio' : tab === 'signup' ? 'Create Free Account' : 'Send Reset Link'}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-zinc-500">
            Guest mode is also fully active. You can generate songs and export lossless WAVs anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
