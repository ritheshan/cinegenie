import { motion } from 'framer-motion';

interface MediaCardProps {
  media: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    posterPath?: string;
    vote_average?: number;
    rating?: number;
    release_date?: string;
    first_air_date?: string;
    releaseDate?: string;
    media_type?: string;
    mediaType?: string;
  };
  type?: 'movie' | 'tv';
  isWatched: boolean;
  inWatchlist?: boolean;
  onAddWatched?: () => void;
  onRemoveWatched?: () => void;
  onAddWatchlist?: () => void;
  onRemoveWatchlist?: () => void;
  onTalk?: () => void;
  onClick?: () => void;
  index?: number;
}

export default function MediaCard({
  media, isWatched, inWatchlist, onAddWatched, onRemoveWatched, onAddWatchlist, onRemoveWatchlist, onTalk, onClick, index = 0,
}: MediaCardProps) {
  const title = media.title || media.name || 'Untitled';
  const poster = media.poster_path || media.posterPath;
  const rating = media.vote_average || media.rating || 0;
  const date = media.release_date || media.first_air_date || media.releaseDate || '';
  const year = date?.substring(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/60 transition-all group cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 relative"
    >
      <div className="relative" onClick={onClick}>
        {poster ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${poster}`}
            alt={title}
            className="w-full h-auto object-cover group-hover:opacity-80 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-slate-700 flex items-center justify-center text-slate-500 text-sm">
            No Poster
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2 pb-3">
          {/* Watched Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); isWatched ? onRemoveWatched?.() : onAddWatched?.(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110 backdrop-blur-sm shadow-md ${isWatched ? 'bg-slate-500/90 hover:bg-red-500/90' : 'bg-emerald-500/90 hover:bg-emerald-400'}`}
            title={isWatched ? "Remove from Watched" : "Add to Watched"}
          >
            {isWatched ? '✓' : '👁️'}
          </button>
          
          {/* Watchlist Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); inWatchlist ? onRemoveWatchlist?.() : onAddWatchlist?.(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110 backdrop-blur-sm shadow-md ${inWatchlist ? 'bg-amber-500/90 hover:bg-amber-400' : 'bg-slate-600/90 hover:bg-slate-500'}`}
            title={inWatchlist ? "Remove from Watchlist" : "Save for Later"}
          >
            🔖
          </button>

          {/* Mic */}
          {onTalk && (
            <button
              onClick={(e) => { e.stopPropagation(); onTalk(); }}
              className="w-9 h-9 rounded-full bg-purple-500/90 hover:bg-purple-400 flex items-center justify-center text-white text-sm transition-all hover:scale-110 backdrop-blur-sm shadow-md"
              title="Talk About"
            >
              🎤
            </button>
          )}
        </div>
      </div>

      {/* Watched badge */}
      {isWatched && (
        <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold shadow-md">
          👁️
        </div>
      )}
      
      {/* Watchlist badge */}
      {!isWatched && inWatchlist && (
        <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold shadow-md">
          🔖
        </div>
      )}

      <div className="p-3" onClick={onClick}>
        <h3 className="font-bold text-sm mb-1 truncate text-white">{title}</h3>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{year}</span>
          <span className="bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded font-medium">
            ★ {rating?.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
