import { motion } from 'framer-motion';
import { Eye, Check, Bookmark, Mic, Star } from 'lucide-react';

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-cine-surface rounded overflow-hidden border border-cine-border hover:border-cine-accent transition-all duration-300 group cursor-pointer relative"
    >
      <div className="relative aspect-[2/3] bg-cine-bg overflow-hidden" onClick={onClick}>
        {poster ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${poster}`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cine-text-muted text-xs uppercase font-bold bg-cine-bg">
            No Poster
          </div>
        )}

        {/* High-end minimalist action overlay */}
        <div className="absolute inset-0 bg-cine-bg/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
          {onTalk && (
            <button
              onClick={(e) => { e.stopPropagation(); onTalk(); }}
              className="w-full py-1.5 bg-cine-accent text-cine-bg text-[9px] uppercase font-bold tracking-widest hover:bg-opacity-95 rounded transition-all flex items-center justify-center gap-1.5"
              title="Speak Critique"
            >
              <Mic className="w-3.5 h-3.5 stroke-[2]" />
              Talk Critique
            </button>
          )}
          
          <div className="flex gap-2 w-full">
            {/* Watched Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); isWatched ? onRemoveWatched?.() : onAddWatched?.(); }}
              className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border flex items-center justify-center gap-1 ${
                isWatched 
                  ? 'bg-cine-bg border-cine-border text-red-400 hover:bg-cine-card' 
                  : 'bg-cine-surface border-cine-border text-cine-text-primary hover:border-cine-accent'
              }`}
              title={isWatched ? "Remove Watched" : "Mark Watched"}
            >
              {isWatched ? <Check className="w-3.5 h-3.5 stroke-[2]" /> : <Eye className="w-3.5 h-3.5 stroke-[1.75]" />}
              {isWatched ? 'Watched' : 'Log'}
            </button>
            
            {/* Watchlist Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); inWatchlist ? onRemoveWatchlist?.() : onAddWatchlist?.(); }}
              className={`py-1.5 px-3 rounded transition-all border flex items-center justify-center ${
                inWatchlist 
                  ? 'bg-cine-accent/10 border-cine-accent/30 text-cine-accent' 
                  : 'bg-cine-surface border-cine-border text-cine-text-secondary hover:border-cine-accent'
              }`}
              title={inWatchlist ? "Remove Saved" : "Save for Later"}
            >
              <Bookmark className={`w-3.5 h-3.5 stroke-[1.75] ${inWatchlist ? 'fill-cine-accent' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Top right badges - minimal letterboxd style */}
      {isWatched && (
        <div className="absolute top-2.5 right-2.5 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-cine-bg shadow-md">
          <Check className="w-3 h-3 stroke-[2.5]" />
        </div>
      )}
      
      {!isWatched && inWatchlist && (
        <div className="absolute top-2.5 right-2.5 bg-cine-accent rounded-full w-5 h-5 flex items-center justify-center text-cine-bg shadow-md">
          <Bookmark className="w-3 h-3 stroke-[2] fill-cine-bg" />
        </div>
      )}

      <div className="p-3" onClick={onClick}>
        <h3 className="font-bold text-xs uppercase tracking-wider mb-1 truncate text-cine-text-primary group-hover:text-cine-accent transition-colors">
          {title}
        </h3>
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-cine-text-muted mt-1">
          <span>{year}</span>
          <span className="text-cine-accent font-bold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-cine-accent text-cine-accent stroke-none" />
            {rating?.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
