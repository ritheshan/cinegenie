import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useToastContext } from '../components/common/ToastContext';
import MovieScrollingWall from '../components/common/MovieScrollingWall';

type ApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

interface AuthPageProps {
  mode: 'login' | 'register';
}

export default function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToastContext();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear form errors when mode changes
  useEffect(() => {
    setError('');
  }, [mode]);

  // Read URL query errors (e.g. from Google OAuth)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const err = searchParams.get('error');
    if (err) {
      if (err === 'GoogleAuthFailed') {
        setError('Google Authentication failed. Please try again.');
        addToast('Google login failed', 'error');
      } else if (err === 'NoCodeProvided') {
        setError('No authorization code provided.');
      }
    }
  }, [location.search, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.login({ username, password });
        setAuth(response.user, response.token);
        addToast(`Welcome back, ${response.user.name}!`, 'success');
        navigate('/dashboard');
      } else {
        const response = await authApi.register({ name, username, email, password });
        setAuth(response.user, response.token);
        addToast(`Account created successfully! Welcome, ${response.user.name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const msg = apiError.response?.data?.error || (isLogin ? 'Login failed' : 'Registration failed');
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/auth/google-url`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Google login failed to initialize');
      addToast('Google login error', 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Form Panel */}
      <motion.div
        layout="position"
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 sm:px-12 py-10 z-20 bg-slate-900/90 backdrop-blur-md border-slate-800 ${
          isLogin ? 'order-1 border-r' : 'order-2 border-l'
        }`}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <span className="text-3xl">🎥</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              CineGenie
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              {isLogin
                ? 'Sign in to talk about your favorite movies and tv shows'
                : 'Join the premier cinema exploration and speech AI platform'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 bg-slate-850 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-slate-100 text-sm font-medium"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cinephile_99"
                className="w-full px-4 py-3.5 bg-slate-850 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-slate-100 text-sm font-medium"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Gmail Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-4 py-3.5 bg-slate-850 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-slate-100 text-sm font-medium"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-slate-850 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all text-slate-100 text-sm font-medium"
                required
                minLength={isLogin ? 1 : 6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/10'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/10'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Register Account'
              )}
            </button>
          </form>

          {isLogin && (
            <>
              <div className="my-6 flex items-center justify-center space-x-2">
                <span className="h-px bg-slate-800 flex-1"></span>
                <span className="text-slate-500 text-xs font-bold tracking-wider uppercase">OR</span>
                <span className="h-px bg-slate-800 flex-1"></span>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full bg-slate-800/80 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all border border-slate-700/85 hover:border-slate-600 text-sm gap-3"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
            </>
          )}

          {/* Toggle Button */}
          <p className="mt-8 text-center text-slate-400 text-sm font-medium">
            {isLogin ? (
              <>
                New to CineGenie?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                  Sign in instead
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Wall Panel */}
      <motion.div
        layout="position"
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`hidden lg:block lg:w-[55%] xl:w-[60%] h-screen relative overflow-hidden ${
          isLogin ? 'order-2' : 'order-1'
        }`}
      >
        <MovieScrollingWall />
      </motion.div>
    </div>
  );
}
