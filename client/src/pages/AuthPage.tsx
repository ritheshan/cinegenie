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

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

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
        const response = await authApi.register({ name, username, password });
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
      let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      if (apiUrl.endsWith('/')) {
        apiUrl = apiUrl.slice(0, -1);
      }
      if (!apiUrl.endsWith('/api')) {
        apiUrl = `${apiUrl}/api`;
      }
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
    <MovieScrollingWall>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-full max-w-md px-4 sm:px-6 py-10 z-10 bg-transparent"
      >
        <div className="max-w-md w-full mx-auto bg-transparent border border-cine-border/40 backdrop-blur-[3px] p-8 sm:p-10 rounded shadow-2xl relative">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <span className="text-xl">🎥</span>
            <span className="text-lg font-bold uppercase tracking-[0.25em] text-cine-text-primary">
              CineGenie
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-accent mb-2">Gate Pass</p>
            <h2 className="text-2xl font-bold uppercase font-heading tracking-wide text-cine-text-primary">
              {isLogin ? 'Welcome Back' : 'Create Profile'}
            </h2>
            <p className="text-xs text-cine-text-secondary mt-1 font-semibold">
              {isLogin
                ? 'Sign in to critique your library with speech AI'
                : 'Join the premier global cinephile logging community'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded text-xs uppercase font-bold tracking-wider mb-6 flex items-center gap-2"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-cine-bg/50 border border-cine-border/60 rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all text-xs font-medium"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cinephile_99"
                className="w-full px-4 py-2.5 bg-cine-bg/50 border border-cine-border/60 rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all text-xs font-medium"
                required
              />
            </div>



            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-cine-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-cine-bg/50 border border-cine-border/60 rounded focus:outline-none focus:border-cine-accent text-cine-text-primary transition-all text-xs font-medium"
                required
                minLength={isLogin ? 1 : 6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-cine-accent text-cine-bg font-bold uppercase tracking-wider text-xs rounded transition-all hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border border-cine-bg border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Profile'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center justify-center space-x-2">
            <span className="h-px bg-cine-border/50 flex-1"></span>
            <span className="text-cine-text-muted text-[9px] font-bold tracking-widest uppercase">OR</span>
            <span className="h-px bg-cine-border/50 flex-1"></span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-cine-bg/50 hover:bg-cine-card/75 text-cine-text-primary font-bold uppercase tracking-wider py-3 rounded flex items-center justify-center transition-all border border-cine-border/60 hover:border-cine-accent text-[10px] gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>

          {/* Toggle Button */}
          <p className="mt-8 text-center text-cine-text-secondary text-xs font-semibold">
            {isLogin ? (
              <>
                New to CineGenie?{' '}
                <Link to="/register" className="text-cine-accent hover:underline font-bold transition-all">
                  Create profile
                </Link>
              </>
            ) : (
              <>
                Already have a profile?{' '}
                <Link to="/login" className="text-cine-accent hover:underline font-bold transition-all">
                  Sign in instead
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </MovieScrollingWall>
  );
}
