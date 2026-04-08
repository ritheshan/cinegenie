import { motion } from 'framer-motion';
import { useGenres } from '../../hooks/useDiscover';

interface GenrePillsProps {
  type: 'movie' | 'tv';
  selectedGenreId: number | null;
  onSelect: (genreId: number | null) => void;
}

export default function GenrePills({ type, selectedGenreId, onSelect }: GenrePillsProps) {
  const { data: genres, isLoading } = useGenres(type);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-8" style={{ scrollbarWidth: 'none' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-slate-800 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-8"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* "All" pill */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          selectedGenreId === null
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
        }`}
      >
        All
      </motion.button>

      {genres?.map((genre) => (
        <motion.button
          key={genre.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(genre.id === selectedGenreId ? null : genre.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
            selectedGenreId === genre.id
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {genre.name}
        </motion.button>
      ))}
    </div>
  );
}
