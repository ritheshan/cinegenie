import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X } from 'lucide-react';
import {
  useInfiniteActorsByFilter,
  useActorSearch,
} from '../hooks/useActors';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ActorSearch from '../components/actor/ActorSearch';
import ActorLanguageFilter from '../components/actor/ActorLanguageFilter';
import Navbar from '../components/common/Navbar';

// ── Actor card ─────────────────────────────────────────────────────────────
function ActorGridCard({ actor, index }: { actor: any; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4) }}
      onClick={() => navigate(`/actors/${actor.id}`)}
      className="group cursor-pointer flex flex-col items-center text-center"
    >
      <div className="relative w-full aspect-[2/3] rounded overflow-hidden bg-cine-surface border border-cine-border group-hover:border-cine-accent transition-all duration-300 shadow-lg mb-3">
        {actor.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
            alt={actor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cine-surface text-cine-text-muted">
            <User className="w-12 h-12 stroke-[1.25] text-cine-text-muted/65" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <span className="text-cine-accent text-[9px] font-bold uppercase tracking-widest">View Profile →</span>
        </div>
      </div>
      <p className="text-xs font-bold text-cine-text-primary uppercase tracking-wide truncate w-full group-hover:text-cine-accent transition-colors">{actor.name}</p>
      <p className="text-[10px] text-cine-text-muted font-bold uppercase tracking-wider mt-1">{actor.known_for_department || 'Acting'}</p>
    </motion.div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function ActorSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-[2/3] rounded bg-cine-surface border border-cine-border animate-pulse" />
      <div className="h-3 w-3/4 bg-cine-surface rounded animate-pulse" />
      <div className="h-2.5 w-1/2 bg-cine-surface rounded animate-pulse" />
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
    <div className="min-h-screen bg-cine-bg text-cine-text-primary">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-text-muted mb-2">Talent Index</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary mb-3">
            Star Directory
          </h1>
          <p className="text-xs text-cine-text-secondary mb-6 font-semibold">
            {selectedLanguage
              ? `Browse cinematic figures associated with ${selectedLanguage.toUpperCase()} media`
              : 'Browse popular and influential global cinema artists'}
          </p>

          {/* Search & Filter Shelf */}
          <div className="grid md:grid-cols-3 gap-6 items-end border-t border-b border-cine-border py-6">
            <div className="md:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-text-muted mb-2">Search Artists</p>
              <ActorSearch />
            </div>
            <div className="md:col-span-2">
              <ActorLanguageFilter
                selected={selectedLanguage}
                onSelect={(code) => setSelectedLanguage(code)}
                label="Filter by Region / Language"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Search results (overlay mode) ─────────────────────────── */}
        {isSearchMode && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cine-text-primary mb-4">Search Results for "{searchQuery}"</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
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
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cine-text-muted">
                  {actors.length > 0 ? `${actors.length} actors loaded` : ''}
                </p>
                {selectedLanguage && (
                  <button
                    onClick={() => setSelectedLanguage(null)}
                    className="text-[9px] uppercase tracking-wider font-bold text-cine-text-secondary hover:text-cine-text-primary bg-cine-surface border border-cine-border px-3 py-1.5 rounded transition-all flex items-center gap-1"
                  >
                    <X className="w-3 h-3 stroke-[2]" />
                    <span>Clear filter</span>
                  </button>
                )}
              </div>

              {/* Grid */}
              {activeQuery.isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                  {Array.from({ length: 21 }).map((_, i) => <ActorSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                    {actors.map((actor: any, i: number) => (
                      <ActorGridCard key={actor.id} actor={actor} index={i % 21} />
                    ))}
                  </div>

                  {/* Infinite scroll sentinel */}
                  <div ref={sentinelRef} className="flex justify-center py-12">
                    {activeQuery.isFetchingNextPage && (
                      <div className="flex items-center gap-3 text-cine-text-secondary">
                        <div className="w-4 h-4 border border-cine-accent border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Loading more artists...</span>
                      </div>
                    )}
                    {!activeQuery.hasNextPage && actors.length > 0 && (
                      <p className="text-cine-text-muted text-[10px] uppercase font-bold tracking-wider">End of catalog reached</p>
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
