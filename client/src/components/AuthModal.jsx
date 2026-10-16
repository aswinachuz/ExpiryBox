import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { registerUser, loginUser, loginWithGoogle } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, _lang = 'en' }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: localStorage.getItem('expirybox_remembered_email') || '',
    phone: '',
    password: '',
  });
  const [googleEmail, setGoogleEmail] = useState('');
  const [showGoogleInput, setShowGoogleInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'register') {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please provide Name, Email, and Password.');
          setLoading(false);
          return;
        }
        const res = await registerUser(formData);
        if (res.success) {
          localStorage.setItem('expirybox_remembered_email', formData.email);
          onAuthSuccess(res.user);
          onClose();
        }
      } else {
        if (!formData.email || !formData.password) {
          setError('Please enter your email and password.');
          setLoading(false);
          return;
        }
        const res = await loginUser({ email: formData.email, password: formData.password });
        if (res.success) {
          localStorage.setItem('expirybox_remembered_email', formData.email);
          onAuthSuccess(res.user);
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async (customEmail) => {
    setLoading(true);
    setError('');
    const targetEmail = customEmail || googleEmail || 'aswin.personal@gmail.com';

    try {
      const res = await loginWithGoogle({
        email: targetEmail,
        name: targetEmail.split('@')[0],
        avatar: '🌐',
        googleId: `google_${Date.now()}`,
      });

      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ink-primary text-white flex items-center justify-center font-bold text-base shadow-xs">
              📦
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">
                {tab === 'login' ? 'Sign In to ExpiryBox' : 'Create ExpiryBox Account'}
              </h2>
              <p className="text-xs text-ink-secondary">
                Secure your family documents, reminders, and warranties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF9F6] rounded-2xl border border-[#E7E5E4] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-white text-ink-primary shadow-xs border border-[#E7E5E4]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-white text-ink-primary shadow-xs border border-[#E7E5E4]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google / Gmail Instant Connection */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleGoogleConnect()}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl border border-[#E7E5E4] hover:border-amber-300 hover:bg-[#FAF9F6] bg-white flex items-center justify-center gap-2.5 text-xs font-bold text-ink-primary shadow-xs transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Connect with Gmail / Google</span>
          </button>

          {!showGoogleInput ? (
            <button
              type="button"
              onClick={() => setShowGoogleInput(true)}
              className="w-full text-center text-[11px] text-amber-800 hover:underline"
            >
              Enter a different Gmail address
            </button>
          ) : (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleGoogleConnect(googleEmail)}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-800 text-white rounded-xl"
              >
                Connect
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E7E5E4] w-full" />
          <span className="bg-white px-2 text-[11px] uppercase tracking-wider text-ink-muted">
            or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Aswin Kumar"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="aswin@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                Mobile Number (For Alerts & Reminders)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98470 12345"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-ink-primary hover:bg-[#2D3748] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[11px] text-ink-muted text-center pt-1">
          🔐 100% Private: Your credentials and documents are stored securely in your local environment.
        </p>
      </div>
    </div>
  );
}
