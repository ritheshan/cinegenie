import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useActorSearch } from '../../hooks/useActors';
import { Search, X, User } from 'lucide-react';

interface ActorSearchProps {
  onClose?: () => void;
  className?: string;
}

export default function ActorSearch({ onClose, className = '' }: ActorSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex items-center gap-2 bg-cine-bg border border-cine-border rounded px-4 py-2 text-xs focus-within:border-cine-accent transition-colors">
        <Search className="w-3.5 h-3.5 text-cine-text-muted flex-shrink-0 stroke-[2.5]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actors, directors..."
          className="flex-1 bg-transparent text-cine-text-primary placeholder:text-cine-text-muted focus:outline-none min-w-0 font-medium"
        />
        {isFetching && (
          <div className="w-3.5 h-3.5 border border-cine-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
        {query && (
          <button onClick={() => setQuery('')} className="text-cine-text-muted hover:text-cine-text-primary transition-colors flex items-center">
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {results.length > 0 && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 left-0 right-0 bg-cine-surface border border-cine-border rounded shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto"
          >
            {results.slice(0, 8).map((actor: any) => (
              <button
                key={actor.id}
                onClick={() => handleSelect(actor)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cine-card transition-colors text-left border-b border-cine-border last:border-b-0"
              >
                <div className="w-9 h-9 rounded bg-cine-bg border border-cine-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-cine-text-muted/65" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cine-text-primary truncate uppercase tracking-wider">{actor.name}</p>
                  <p className="text-[10px] text-cine-text-muted font-bold uppercase tracking-wider mt-0.5">{actor.known_for_department || 'Actor'}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
