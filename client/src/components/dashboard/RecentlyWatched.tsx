import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface RecentlyWatchedProps {
  items: any[];
}

export default function RecentlyWatched({ items }: RecentlyWatchedProps) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 mb-8">
      <div className="flex justify-between items-end mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-accent mb-1">Your Library</p>
          <h2 className="text-lg font-bold uppercase font-heading tracking-wider text-cine-text-primary">Recently Logged</h2>
        </div>
        <button 
          onClick={() => navigate('/watched')}
          className="text-[10px] uppercase tracking-wider text-cine-accent hover:underline font-bold"
        >
          View Archive →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
        {items.map((item, i) => {
          const title = item.title || item.name;
          const year = item.releaseDate?.substring(0, 4) || '';
          
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/media/${item.mediaType}/${item.mediaId}`)}
              className="min-w-[140px] md:min-w-[160px] max-w-[140px] md:max-w-[160px] bg-cine-surface rounded overflow-hidden border border-cine-border hover:border-cine-accent transition-all cursor-pointer snap-start group"
            >
              <div className="relative aspect-[2/3] bg-cine-bg overflow-hidden">
                {item.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-cine-bg flex items-center justify-center text-cine-text-muted text-[10px] uppercase font-bold">
                    No Poster
                  </div>
                )}
                <div className="absolute inset-0 bg-cine-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-cine-accent text-cine-bg px-2.5 py-1 rounded">Log Info</span>
                </div>
              </div>
              <div className="p-3 bg-cine-surface">
                <h3 className="font-bold text-[11px] truncate uppercase tracking-wider text-cine-text-primary group-hover:text-cine-accent transition-colors">{title}</h3>
                <div className="flex justify-between items-center text-[9px] text-cine-text-muted mt-1 uppercase font-bold">
                  <span>{year}</span>
                  <span className="text-cine-accent font-bold flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-cine-accent text-cine-accent stroke-none" />
                    {item.rating?.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
