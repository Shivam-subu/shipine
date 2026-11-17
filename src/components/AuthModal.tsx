import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { X, Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, register } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    let success = false;
    if (isRegister) {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      success = await register(email, password, fullName, phone);
    } else {
      success = await login(email, password);
    }

    setIsLoading(false);
    if (success) {
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setErrorMsg('');
    }
  };

  const handleClose = () => {
    setIsAuthOpen(false);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8DDCB] relative">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-[#777777] hover:text-[#242424] rounded-full hover:bg-[#FAF8F4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-[#242424] uppercase block">
            Shipine
          </span>
          <p className="text-xs text-[#777777] mt-1.5">
            {isRegister
              ? 'Create an account for anti-tarnish warranty, order tracking, and member offers'
              : 'Sign in with your email and password to access your orders and account'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#242424] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#777777] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#242424] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#242424] mb-1.5">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#777777] absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="+91"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#242424]">Password</label>
              {isRegister && <span className="text-[10px] text-[#777777]">Min. 6 characters</span>}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-[#FAF8F4]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#777777] hover:text-[#242424] p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#242424] text-white hover:bg-[#C5A46D] transition-colors rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm disabled:opacity-50 cursor-pointer mt-3"
          >
            {isLoading ? 'Authenticating with Supabase...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 text-center text-xs text-[#777777] pt-4 border-t border-[#E8DDCB]/60">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                className="font-semibold text-[#242424] hover:text-[#C5A46D] underline ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Shipine?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                className="font-semibold text-[#242424] hover:text-[#C5A46D] underline ml-1 cursor-pointer"
              >
                Create Account
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
