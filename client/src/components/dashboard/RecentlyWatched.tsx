import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RecentlyWatchedProps {
  items: any[];
}

export default function RecentlyWatched({ items }: RecentlyWatchedProps) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 mb-8">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-slate-200">Recently Watched</h2>
        <button 
          onClick={() => navigate('/watched')}
          className="text-sm text-purple-400 hover:text-purple-300 font-medium"
        >
          View all →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
        {items.map((item, i) => {
          const title = item.title || item.name;
          const year = item.releaseDate?.substring(0, 4) || '';
          
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/media/${item.mediaType}/${item.mediaId}`)}
              className="min-w-[140px] md:min-w-[160px] max-w-[140px] md:max-w-[160px] bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/60 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 snap-start"
            >
              {item.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                  alt={title}
                  className="w-full h-[210px] md:h-[240px] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[210px] md:h-[240px] bg-slate-700 flex items-center justify-center text-slate-500 text-xs">
                  No Poster
                </div>
              )}
              <div className="p-3">
                <h3 className="font-bold text-xs truncate text-white">{title}</h3>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>{year}</span>
                  <span className="text-purple-400 font-medium">★ {item.rating?.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
