import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle
} from 'lucide-react';
import { FIXED_ADMIN_CREDENTIALS } from '../../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = userId.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('অনুগ্রহ করে ইউজার আইডি ও পাসওয়ার্ড উভয়ই লিখুন।');
      return;
    }

    if (
      trimmedUser.toLowerCase() === FIXED_ADMIN_CREDENTIALS.userId.toLowerCase() &&
      trimmedPass === FIXED_ADMIN_CREDENTIALS.password
    ) {
      onSuccess();
      onClose();
      setUserId('');
      setPassword('');
      setError(null);
    } else {
      setError('ভুল ইউজার আইডি অথবা পাসওয়ার্ড! সঠিক আইডি ও পাসওয়ার্ড দিন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            অ্যাডমিন লগইন
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            ExamArchive অ্যাডমিন প্যানেলে প্রবেশের জন্য পাসওয়ার্ড দিন
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* User ID Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              অ্যাডমিন ইউজার আইডি (User ID)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="অ্যাডমিন ইউজার আইডি লিখুন"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              লগইন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
