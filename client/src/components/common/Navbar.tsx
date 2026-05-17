import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Settings, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  // Dynamic Navigation Links - Minimal Editorial Style
  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard',   label: 'Dashboard' },
        { path: '/watched',     label: 'Library' },
        { path: '/movies',      label: 'Discover' },
        { path: '/actors',      label: 'Stars' },
        { path: '/journal',     label: 'Journal' },
        { path: '/leaderboard', label: 'Leaderboard' },
      ]
    : [
        { path: '/movies',      label: 'Discover' },
        { path: '/actors',      label: 'Stars' },
        { path: '/leaderboard', label: 'Leaderboard' },
      ];

  const logoPath = isAuthenticated ? '/dashboard' : '/';

  return (
    <nav className="h-[68px] bg-cine-surface border-b border-cine-border sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8">
      {/* Brand Identity */}
      <div className="flex items-center gap-8">
        <Link to={logoPath} className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-cine-text-primary font-heading">
            Cine<span className="text-cine-accent">Genie</span>
          </span>
        </Link>
        
        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative py-[23px] text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                isActive(link.path)
                  ? 'text-cine-accent'
                  : 'text-cine-text-secondary hover:text-cine-text-primary'
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cine-accent animate-fade-in" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Profile & CTA Panel */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="relative">
            {/* Matte Profile Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-cine-card hover:bg-[#2A2A2E] px-3.5 py-2 rounded border border-cine-border transition-all text-left"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-cine-surface border border-cine-border flex items-center justify-center text-cine-accent text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-cine-text-primary text-xs font-semibold hidden sm:block">{user?.name}</span>
              <span className="text-cine-text-muted text-[10px] hidden sm:block">▼</span>
            </button>

            {/* Minimal Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                
                <div className="absolute right-0 mt-2 w-56 bg-cine-surface border border-cine-border rounded shadow-2xl py-2 z-40 origin-top-right">
                  {/* Account overview section */}
                  <div className="px-4 py-3 border-b border-cine-border mb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cine-text-muted">Account</p>
                    <p className="text-sm font-semibold text-cine-text-primary truncate mt-0.5">{user?.name}</p>
                    <p className="text-xs text-cine-text-secondary truncate">@{user?.username || 'user'}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-cine-text-secondary hover:text-cine-text-primary hover:bg-cine-card transition-all"
                  >
                    <Settings className="w-4.5 h-4.5 stroke-[1.75]" />
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-red-400 hover:text-red-300 hover:bg-cine-card transition-all text-left"
                  >
                    <LogOut className="w-4.5 h-4.5 stroke-[1.75]" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs uppercase tracking-wider font-bold text-cine-text-secondary hover:text-cine-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-cine-bg bg-cine-accent hover:bg-opacity-95 rounded transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
