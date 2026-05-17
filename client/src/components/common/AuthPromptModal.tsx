import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

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
        className="fixed inset-0 bg-[#0A0A0B]/85 backdrop-blur-[4px] transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-cine-surface border border-cine-border/80 rounded max-w-md w-full p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in origin-center">
        {/* Subtle, elegant top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-cine-accent" />

        {/* Header Icon */}
        <div className="relative flex items-center justify-center border border-cine-border w-14 h-14 rounded mx-auto mb-6 bg-cine-bg">
          <Film className="w-6 h-6 text-cine-accent stroke-[1.75]" />
        </div>

        {/* Content */}
        <div className="relative text-center">
          <h3 className="text-xl font-bold uppercase tracking-wider text-cine-text-primary mb-3 font-heading">
            CineGenie Account Required
          </h3>
          <p className="text-xs text-cine-text-secondary leading-relaxed mb-8 font-medium">
            You need a CineGenie account to <span className="text-cine-accent font-semibold">{actionText}</span>. Sign up or log in today to start voice journaling and building your premium cinematic archive shelf!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/register"
              className="w-full py-3 bg-cine-accent hover:bg-opacity-95 text-cine-bg font-bold rounded text-xs uppercase tracking-wider transition-all text-center"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full py-3 bg-cine-bg hover:bg-cine-card text-cine-text-primary font-bold rounded border border-cine-border transition-all text-center text-xs uppercase tracking-wider"
            >
              Sign In
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-[10px] text-cine-text-muted hover:text-cine-text-secondary font-bold uppercase tracking-widest transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
