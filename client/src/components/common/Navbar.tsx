import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard',   label: 'Dashboard',   icon: '📊' },
    { path: '/watched',     label: 'Library',     icon: '🍿' },
    { path: '/movies',      label: 'Discover',    icon: '🎬' },
    { path: '/actors',      label: 'Actors',      icon: '🌟' },
    { path: '/journal',     label: 'Journal',     icon: '🎙️' },
    { path: '/leaderboard', label: 'Leaderboard',  icon: '🏆' },
  ];

  return (
    <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 mr-8">
              <span className="text-2xl">🎥</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                CineGenie
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-slate-700/30 hover:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-700/40 transition-all text-left"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-600" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-slate-300 text-sm hidden md:block font-semibold">{user?.name}</span>
                <span className="text-slate-500 text-xs hidden md:block">▼</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  
                  <div className="absolute right-0 mt-2.5 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl py-2 z-40 animate-fade-in-down origin-top-right">
                    {/* Header info */}
                    <div className="px-4 py-2 border-b border-slate-700/50 mb-1.5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-bold text-white truncate mt-0.5">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{user?.username || 'user'}</p>
                    </div>

                    {/* Settings Option */}
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                    >
                      <span className="text-base">👤</span>
                      <span className="font-medium">Profile Settings</span>
                    </Link>

                    {/* Logout Option */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-white hover:bg-red-500/80 transition-all text-left"
                    >
                      <span className="text-base">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-2 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(link.path)
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
