import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-[120px] leading-none mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-cyan-500 opacity-80">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
