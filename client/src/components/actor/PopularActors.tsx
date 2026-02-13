import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopularActors } from '../../hooks/useActors';
import ActorCard from './ActorCard';

export default function PopularActors() {
  const { data: actors = [], isLoading } = usePopularActors();
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === 'right' ? 400 : -400, behavior: 'smooth' });
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between px-4 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">🌟 Popular Actors</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/actors')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold"
          >
            Browse All →
          </button>
          <div className="flex gap-1">
            <button onClick={() => scroll('left')}  className="w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">‹</button>
            <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">›</button>
          </div>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-3 px-4 md:px-8"
        style={{ scrollbarWidth: 'none' }}
      >
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="min-w-[100px] flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-slate-800 animate-pulse" />
                <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
              </div>
            ))
          : actors.slice(0, 20).map((actor: any, i: number) => (
              <div key={actor.id} className="min-w-[100px] max-w-[100px]">
                <ActorCard actor={actor} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
