import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { SUPPORTED_LANGUAGES } from '../api/language.api';
import {
  useLanguageMoviesRow,
  useLanguageTvRow,
  useLanguageActors,
  useInfiniteLanguageMovies,
  useInfiniteLanguageTv,
} from '../hooks/useLanguage';
import { useInfiniteActorMovies, useInfiniteActorTv } from '../hooks/useActors';
import { useWatchedStatus, useAddWatched, useRemoveWatched } from '../hooks/useWatched';
import { useToastContext } from '../components/common/ToastContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import SkeletonCard from '../components/common/SkeletonCard';

// ── Shared media card ─────────────────────────────────────────────────────────
function MediaCard({
  item, type, isWatched, onAdd, onRemove,
}: { item: any; type: 'movie' | 'tv'; isWatched: boolean; onAdd: () => void; onRemove: () => void }) {
  const navigate = useNavigate();
  const title = item.title || item.name || 'Untitled';
  const year  = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/media/${type}/${item.id}`)}>
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-slate-800 border border-slate-700/40 group-hover:border-purple-500/60 transition-all">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No poster</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/65 transition-all flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
          {isWatched ? (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-8 h-8 rounded-full bg-emerald-500/90 flex items-center justify-center text-white text-sm hover:bg-red-500 transition-colors" title="Remove">✓</button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-8 h-8 rounded-full bg-purple-500/90 flex items-center justify-center text-white text-lg hover:bg-purple-400 transition-colors" title="Add">+</button>
          )}
          <button onClick={(e) => { e.stopPropagation(); navigate(`/media/${type}/${item.id}?talk=true`); }}
            className="w-8 h-8 rounded-full bg-slate-700/90 flex items-center justify-center text-sm hover:bg-slate-600 transition-colors" title="Talk">🎤</button>
        </div>
        {isWatched && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
        )}
      </div>
      <p className="text-xs font-semibold text-white truncate mt-2">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{year}</p>
    </div>
  );
}

// ── Horizontal media row ──────────────────────────────────────────────────────
function LangMediaRow({ title, items, isLoading, type, watchedIds, onAdd, onRemove }: {
  title: string; items: any[]; isLoading: boolean;
  type: 'movie' | 'tv'; watchedIds: Set<number>;
  onAdd: (item: any) => void; onRemove: (item: any) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3 px-4 md:px-0">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="min-w-[130px] aspect-[2/3] bg-slate-800 rounded-lg animate-pulse flex-shrink-0" />
            ))
          : items.slice(0, 18).map((item) => (
              <div key={item.id} className="min-w-[130px] max-w-[130px] flex-shrink-0">
                <MediaCard item={item} type={type} isWatched={watchedIds.has(item.id)}
                  onAdd={() => onAdd(item)} onRemove={() => onRemove(item)} />
              </div>
            ))}
      </div>
    </section>
  );
}

// ── Infinite grid ─────────────────────────────────────────────────────────────
function InfGrid({ query, type, watchedIds, onAdd, onRemove }: {
  query: any; type: 'movie' | 'tv'; watchedIds: Set<number>;
  onAdd: (item: any) => void; onRemove: (item: any) => void;
}) {
  const items = useMemo(() => {
    if (!query.data?.pages) return [];
    const seen = new Set<number>();
    return query.data.pages.flatMap((p: any) => p.results).filter((i: any) => {
      if (seen.has(i.id)) return false; seen.add(i.id); return true;
    });
  }, [query.data]);

  const sentinelRef = useInfiniteScroll(query.fetchNextPage, {
    enabled: !!query.hasNextPage && !query.isFetchingNextPage,
  });

  if (query.isLoading)
    return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>;

  if (!items.length)
    return <div className="text-center py-12 text-slate-500">No results found.</div>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item: any, i: number) => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
            <MediaCard item={item} type={type} isWatched={watchedIds.has(item.id)}
              onAdd={() => onAdd(item)} onRemove={() => onRemove(item)} />
          </motion.div>
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-10">
        {query.isFetchingNextPage
          ? <div className="flex items-center gap-2 text-slate-400"><div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading more...</span></div>
          : !query.hasNextPage && items.length > 0 && <p className="text-slate-600 text-sm">You've reached the end</p>}
      </div>
    </>
  );
}

// ── Actor chip row ─────────────────────────────────────────────────────────────
function ActorChipRow({ actors, isLoading, selectedId, onSelect }: {
  actors: any[]; isLoading: boolean; selectedId: number | null; onSelect: (id: number | null) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-bold text-white">🌟 Popular Actors</h2>
        {selectedId && (
          <button onClick={() => onSelect(null)}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-full transition-all">
            ✕ Clear actor
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 rounded-full bg-slate-800 animate-pulse" />
                <div className="w-12 h-2.5 bg-slate-800 rounded animate-pulse" />
              </div>
            ))
          : actors.map((actor) => {
              const isActive = selectedId === actor.id;
              return (
                <motion.button
                  key={actor.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onSelect(isActive ? null : actor.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                >
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    isActive ? 'border-cyan-400 shadow-lg shadow-cyan-500/40 scale-105' : 'border-slate-700 group-hover:border-purple-500'
                  }`}>
                    {actor.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name}
                        className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xl">👤</div>
                    )}
                  </div>
                  <p className={`text-xs font-semibold text-center w-16 truncate transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                  }`}>{actor.name}</p>
                </motion.button>
              );
            })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type ContentTab = 'movies' | 'tv';

export default function LanguageDetailsPage() {
  const { code = 'en' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const [activeTab,    setActiveTab]    = useState<ContentTab>('movies');
  const [selectedActor, setSelectedActor] = useState<number | null>(null);

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === code);

  // ── Data hooks
  const movieRow   = useLanguageMoviesRow(code);
  const tvRow      = useLanguageTvRow(code);
  const actorsQ    = useLanguageActors(code);

  // Language-level infinite grids (no actor selected)
  const langMoviesInf = useInfiniteLanguageMovies(code);
  const langTvInf     = useInfiniteLanguageTv(code);

  // Actor-filtered infinite grids (actor selected) — language is pre-baked in filters
  const actorMoviesInf = useInfiniteActorMovies(
    selectedActor ?? 0,
    { language: code },
  );
  const actorTvInf = useInfiniteActorTv(
    selectedActor ?? 0,
    { language: code },
  );

  // Watched status
  const addWatched    = useAddWatched();
  const removeWatched = useRemoveWatched();

  const allIds = useMemo(() => {
    const ids = new Set<number>();
    const push = (pages: any) => pages?.pages?.forEach((p: any) => p.results?.forEach((i: any) => ids.add(i.id)));
    push(langMoviesInf.data);
    push(langTvInf.data);
    push(actorMoviesInf.data);
    push(actorTvInf.data);
    movieRow.data?.forEach((i: any) => ids.add(i.id));
    tvRow.data?.forEach((i: any)    => ids.add(i.id));
    return [...ids];
  }, [langMoviesInf.data, langTvInf.data, actorMoviesInf.data, actorTvInf.data, movieRow.data, tvRow.data]);

  const { data: watchedIds = new Set<number>() } = useWatchedStatus(allIds, 'movie');

  const handleAdd = useCallback(async (item: any, type: 'movie' | 'tv') => {
    const title = item.title || item.name || 'Untitled';
    try {
      await addWatched.mutateAsync({
        mediaId: item.id, mediaType: type, title,
        posterPath: item.poster_path || '', backdropPath: item.backdrop_path || '',
        rating: item.vote_average || 0, genres: [],
        overview: item.overview || '', releaseDate: item.release_date || item.first_air_date || '',
      });
      addToast(`Added "${title}" to library`, 'success');
    } catch {
      addToast('Already in your library', 'info');
    }
  }, [addWatched, addToast]);

  const handleRemove = useCallback(async (item: any, type: 'movie' | 'tv') => {
    await removeWatched.mutateAsync({ mediaId: item.id, mediaType: type });
    addToast('Removed from library', 'info');
  }, [removeWatched, addToast]);

  // Determine which infinite query to use for the grid
  const movieGridQuery = selectedActor ? actorMoviesInf : langMoviesInf;
  const tvGridQuery    = selectedActor ? actorTvInf     : langTvInf;

  const selectedActorName = selectedActor
    ? actorsQ.data?.find((a: any) => a.id === selectedActor)?.name
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/languages')}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Languages
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{langInfo?.flag}</span>
            <div>
              <h1 className="text-lg font-black text-white leading-none">{langInfo?.label ?? code.toUpperCase()} Cinema</h1>
              <p className="text-xs text-slate-400">{langInfo?.hero}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ── Top rows (only shown when no actor selected) ───────────────── */}
        {!selectedActor && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LangMediaRow
                title={`🎬 Popular ${langInfo?.label} Movies`}
                items={movieRow.data ?? []} isLoading={movieRow.isLoading}
                type="movie" watchedIds={watchedIds}
                onAdd={(item) => handleAdd(item, 'movie')}
                onRemove={(item) => handleRemove(item, 'movie')}
              />
              <LangMediaRow
                title={`📺 Popular ${langInfo?.label} TV`}
                items={tvRow.data ?? []} isLoading={tvRow.isLoading}
                type="tv" watchedIds={watchedIds}
                onAdd={(item) => handleAdd(item, 'tv')}
                onRemove={(item) => handleRemove(item, 'tv')}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Actor chip row ────────────────────────────────────────────── */}
        <ActorChipRow
          actors={actorsQ.data ?? []}
          isLoading={actorsQ.isLoading}
          selectedId={selectedActor}
          onSelect={setSelectedActor}
        />

        {/* ── Active actor banner ───────────────────────────────────────── */}
        {selectedActor && selectedActorName && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-cyan-600/10 border border-cyan-500/30 rounded-xl px-5 py-3 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-sm text-cyan-300 font-medium">
              Showing <span className="font-bold text-white">{langInfo?.label}</span> media for{' '}
              <span className="font-bold text-cyan-400">{selectedActorName}</span>
            </p>
            <button onClick={() => setSelectedActor(null)}
              className="ml-auto text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700 transition-colors">
              ✕ Clear
            </button>
          </motion.div>
        )}

        {/* ── Tab switcher ──────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 w-fit">
          {([
            { id: 'movies', label: '🎬 Movies' },
            { id: 'tv',     label: '📺 TV Shows' },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Infinite grid ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab + String(selectedActor)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {activeTab === 'movies' ? (
              <InfGrid query={movieGridQuery} type="movie" watchedIds={watchedIds}
                onAdd={(item) => handleAdd(item, 'movie')} onRemove={(item) => handleRemove(item, 'movie')} />
            ) : (
              <InfGrid query={tvGridQuery} type="tv" watchedIds={watchedIds}
                onAdd={(item) => handleAdd(item, 'tv')} onRemove={(item) => handleRemove(item, 'tv')} />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
