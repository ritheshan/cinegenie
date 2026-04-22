import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useActorSearch } from '../../hooks/useActors';

interface ActorSearchProps {
  onClose?: () => void;
  className?: string;
}

export default function ActorSearch({ onClose, className = '' }: ActorSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useActorSearch(debouncedQuery);

  const handleSelect = (actor: any) => {
    navigate(`/actors/${actor.id}`);
    onClose?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2.5 focus-within:border-purple-500 transition-colors">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actors, directors..."
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none min-w-0"
        />
        {isFetching && (
          <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
        {query && (
          <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white transition-colors text-sm">✕</button>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {results.length > 0 && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto"
          >
            {results.slice(0, 8).map((actor: any) => (
              <button
                key={actor.id}
                onClick={() => handleSelect(actor)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-lg">👤</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{actor.name}</p>
                  <p className="text-xs text-slate-400">{actor.known_for_department || 'Actor'}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
