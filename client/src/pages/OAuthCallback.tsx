import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    const processOAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login?error=OAuthFailed');
        return;
      }

      try {
        // Temporarily put the token in Zustand so axios interceptor uses it
        useAuthStore.setState({ token, isAuthenticated: true });
        
        // Fetch the user profile using the new token
        const res = await authApi.getMe();
        
        // Fully authenticate the user
        setAuth(res.data, token);
        
        // Redirect to dashboard, wiping the token from the URL for security
        navigate('/dashboard', { replace: true });
      } catch (err) {
        useAuthStore.setState({ token: null, isAuthenticated: false, user: null });
        navigate('/login?error=OAuthFetchFailed');
      }
    };

    processOAuth();
  }, [location, navigate, setAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-lg text-slate-300">Completing Google Authentication...</p>
    </div>
  );
}
