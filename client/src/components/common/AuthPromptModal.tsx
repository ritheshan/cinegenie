import { Link } from 'react-router-dom';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionText?: string;
}

export default function AuthPromptModal({ isOpen, onClose, actionText = 'track this media' }: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-[2rem] w-full max-w-md p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-purple-500/30 overflow-hidden animate-fade-in origin-center">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* Header Icon */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 w-16 h-16 rounded-2xl mx-auto mb-6 text-3xl">
          🍿
        </div>

        {/* Content */}
        <div className="relative text-center">
          <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-3">
            CineGenie Account Required
          </h3>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            You need a CineGenie account to <span className="font-semibold text-purple-400">{actionText}</span>. Sign up or log in today to start voice journaling and building your cinematic archive!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/register"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg border border-white/5 text-center text-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-700/60 transition-all text-center text-sm"
            >
              Sign In
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-400 font-semibold transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
