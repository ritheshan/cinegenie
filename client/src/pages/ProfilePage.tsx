import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useToastContext } from '../components/common/ToastContext';

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const { addToast } = useToastContext();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, username, email };
      if (password) {
        payload.password = password;
      }

      const res = await authApi.updateProfile(payload);
      if (res.success) {
        setAuth(res.data, token || '');
        addToast('Profile updated successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to update profile');
        addToast(res.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update profile';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary">
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-accent mb-2">User Profile</p>
          <h1 className="text-3xl font-bold uppercase font-heading tracking-wide text-cine-text-primary mb-3">
            Settings
          </h1>
          <p className="text-xs text-cine-text-secondary font-semibold">Manage your account information and credentials</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-cine-surface border border-cine-border rounded p-6 sm:p-8 shadow-xl"
        >
          {error && (
            <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded text-xs uppercase font-bold tracking-wider mb-6 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cine-bg border border-cine-border rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all font-medium text-xs"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cine_master"
                  className="w-full px-4 py-2.5 bg-cine-bg border border-cine-border rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all font-medium text-xs"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">Gmail Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-cine-bg border border-cine-border rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all font-medium text-xs"
                required
              />
            </div>

            <hr className="border-cine-border my-6" />

            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cine-accent mb-4">
              Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-cine-bg border border-cine-border rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all font-medium text-xs"
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-cine-bg border border-cine-border rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all font-medium text-xs"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-cine-accent text-cine-bg hover:opacity-95 font-bold uppercase tracking-wider text-xs rounded transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-cine-bg border-t-transparent rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
