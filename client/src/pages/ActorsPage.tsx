import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useInfiniteActorsByFilter,
  useActorSearch,
} from '../hooks/useActors';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ActorSearch from '../components/actor/ActorSearch';
import ActorLanguageFilter from '../components/actor/ActorLanguageFilter';

// ── Actor card ─────────────────────────────────────────────────────────────
function ActorGridCard({ actor, index }: { actor: any; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      onClick={() => navigate(`/actors/${actor.id}`)}
      className="group cursor-pointer flex flex-col items-center text-center"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 group-hover:border-purple-500 transition-all shadow-lg mb-2">
        {actor.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
            alt={actor.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">👤</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
          <span className="text-white text-xs font-semibold">View Profile →</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-white truncate w-full">{actor.name}</p>
      <p className="text-xs text-slate-500 mt-0.5">{actor.known_for_department || 'Acting'}</p>
    </motion.div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function ActorSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-square rounded-xl bg-slate-800 animate-pulse" />
      <div className="h-3 w-3/4 bg-slate-800 rounded animate-pulse" />
      <div className="h-2.5 w-1/2 bg-slate-800 rounded animate-pulse" />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ActorsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [searchQuery] = useState('');

  const activeQuery = useInfiniteActorsByFilter({
    language: selectedLanguage ?? undefined,
  });

  const { data: searchResults = [] } = useActorSearch(searchQuery);

  // Flatten + deduplicate pages
  const actors = useMemo(() => {
    if (!activeQuery.data?.pages) return [];
    const seen = new Set<number>();
    return activeQuery.data.pages
      .flatMap((p: any) => p.actors ?? p.results ?? [])
      .filter((a: any) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
  }, [activeQuery.data]);

  const sentinelRef = useInfiniteScroll(activeQuery.fetchNextPage, {
    enabled: !!activeQuery.hasNextPage && !activeQuery.isFetchingNextPage,
  });

  const isSearchMode = searchQuery.trim().length >= 2;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🌟 Actors
            </span>
          </h1>
          <p className="text-slate-400 mb-5">
            {selectedLanguage
              ? `Showing actors from ${selectedLanguage.toUpperCase()} cinema`
              : 'Browse popular actors from around the world'}
          </p>

          {/* Search */}
          <div className="max-w-lg mb-6">
            <ActorSearch />
          </div>

          {/* Language filter */}
          <ActorLanguageFilter
            selected={selectedLanguage}
            onSelect={(code) => setSelectedLanguage(code)}
            label="Filter by Language"
          />
        </motion.div>

        {/* ── Search results (overlay mode) ─────────────────────────── */}
        {isSearchMode && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10">
              <h2 className="text-lg font-bold text-white mb-4">Search Results for "{searchQuery}"</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {searchResults.slice(0, 21).map((actor: any, i: number) => (
                  <ActorGridCard key={actor.id} actor={actor} index={i} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Main actor grid ───────────────────────────────────────── */}
        {!isSearchMode && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLanguage ?? 'popular'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
                {/* Status line */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                  {actors.length > 0 ? `${actors.length} actors loaded` : ''}
                </p>
                {selectedLanguage && (
                  <button
                    onClick={() => setSelectedLanguage(null)}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full transition-all"
                  >
                    ✕ Clear language filter
                  </button>
                )}
              </div>

              {/* Grid */}
              {activeQuery.isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                  {Array.from({ length: 21 }).map((_, i) => <ActorSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                    {actors.map((actor: any, i: number) => (
                      <ActorGridCard key={actor.id} actor={actor} index={i % 21} />
                    ))}
                  </div>

                  {/* Infinite scroll sentinel */}
                  <div ref={sentinelRef} className="flex justify-center py-12">
                    {activeQuery.isFetchingNextPage && (
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading more actors...</span>
                      </div>
                    )}
                    {!activeQuery.hasNextPage && actors.length > 0 && (
                      <p className="text-slate-600 text-sm">You've seen all actors</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
