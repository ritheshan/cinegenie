import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useActorDetails, useActorCombined, useInfiniteActorMovies, useInfiniteActorTv } from '../hooks/useActors';
import { useGenres } from '../hooks/useDiscover';
import { useWatchedStatus, useAddWatched, useRemoveWatched } from '../hooks/useWatched';
import { useToastContext } from '../components/common/ToastContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import SkeletonCard from '../components/common/SkeletonCard';
import ActorLanguageFilter from '../components/actor/ActorLanguageFilter';

type CreditTab = 'movies' | 'tv' | 'all';

const SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Most Popular' },
  { value: 'vote_average.desc',   label: 'Top Rated' },
  { value: 'release_date.desc',   label: 'Newest First' },
  { value: 'release_date.asc',    label: 'Oldest First' },
];

// ── Compact media card (reused inside actor page) ──────────────────────────
function ActorMediaCard({
  item, type, isWatched, onAdd, onRemove,
}: { item: any; type: 'movie' | 'tv'; isWatched: boolean; onAdd: () => void; onRemove: () => void }) {
  const navigate = useNavigate();
  const title = item.title || item.name || 'Untitled';
  const year  = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/media/${type}/${item.id}`)}>
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-slate-800 border border-slate-700/50 group-hover:border-purple-500/60 transition-all">
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

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/65 transition-all flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
          {isWatched ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-8 h-8 rounded-full bg-emerald-500/90 flex items-center justify-center text-white text-sm hover:bg-red-500 transition-colors"
              title="Remove from library"
            >✓</button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-8 h-8 rounded-full bg-purple-500/90 flex items-center justify-center text-white text-lg hover:bg-purple-400 transition-colors"
              title="Add to library"
            >+</button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/media/${type}/${item.id}?talk=true`); }}
            className="w-8 h-8 rounded-full bg-slate-700/90 flex items-center justify-center text-sm hover:bg-slate-600 transition-colors"
            title="Talk about it"
          >🎤</button>
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

// ── Infinite grid panel ────────────────────────────────────────────────────
function InfiniteCreditsGrid({
  query, type, watchedIds, onAdd, onRemove,
}: {
  query: any;
  type: 'movie' | 'tv';
  watchedIds: Set<number>;
  onAdd: (item: any) => void;
  onRemove: (item: any) => void;
}) {
  const items = useMemo(() => {
    if (!query.data?.pages) return [];
    const seen = new Set<number>();
    return query.data.pages.flatMap((p: any) => p.results).filter((item: any) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [query.data]);

  const sentinelRef = useInfiniteScroll(query.fetchNextPage, {
    enabled: !!query.hasNextPage && !query.isFetchingNextPage,
  });

  if (query.isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-3">{type === 'movie' ? '🎬' : '📺'}</p>
        <p>No results found for the selected filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item: any, i: number) => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
            <ActorMediaCard
              item={item} type={type}
              isWatched={watchedIds.has(item.id)}
              onAdd={() => onAdd(item)}
              onRemove={() => onRemove(item)}
            />
          </motion.div>
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-10">
        {query.isFetchingNextPage && (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        )}
        {!query.hasNextPage && items.length > 0 && (
          <p className="text-slate-600 text-sm">You've reached the end</p>
        )}
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ActorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const actorId = parseInt(id ?? '0');

  const [activeTab, setActiveTab] = useState<CreditTab>('movies');
  const [movieFilters, setMovieFilters] = useState<{ genre?: number; year?: number; sort_by?: string; language?: string }>({});
  const [tvFilters, setTvFilters]       = useState<{ genre?: number; sort_by?: string; language?: string }>({});
  const [showBio, setShowBio] = useState(false);

  const { data: actor, isLoading: actorLoading } = useActorDetails(actorId);
  const { data: combined }                        = useActorCombined(actorId);
  const { data: movieGenres = [] }                = useGenres('movie');
  const { data: tvGenres = [] }                   = useGenres('tv');

  const movieQuery = useInfiniteActorMovies(actorId, movieFilters);
  const tvQuery    = useInfiniteActorTv(actorId, tvFilters);

  const availableLanguages = useMemo(() => {
    if (!combined?.cast) return [];
    const langs = new Set<string>();
    combined.cast.forEach((item: any) => {
      if (item.original_language) langs.add(item.original_language);
    });
    return Array.from(langs);
  }, [combined]);

  const addWatched    = useAddWatched();
  const removeWatched = useRemoveWatched();

  // Gather all visible IDs for watched status check
  const allIds = useMemo(() => {
    const ids: number[] = [];
    movieQuery.data?.pages?.forEach((p: any) => p.results.forEach((i: any) => ids.push(i.id)));
    tvQuery.data?.pages?.forEach((p: any) => p.results.forEach((i: any) => ids.push(i.id)));
    combined?.cast?.forEach((i: any) => ids.push(i.id));
    return [...new Set(ids)];
  }, [movieQuery.data, tvQuery.data, combined]);

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

  if (actorLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="text-4xl mb-4">😞</p>
          <p className="text-xl font-bold text-white mb-2">Actor not found</p>
          <button onClick={() => navigate(-1)} className="text-purple-400 hover:text-purple-300">← Go back</button>
        </div>
      </div>
    );
  }

  const birthYear = actor.birthday ? actor.birthday.substring(0, 4) : null;
  const age = actor.birthday && !actor.deathday
    ? new Date().getFullYear() - parseInt(birthYear!)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ── Hero section ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Blurred backdrop */}
        {actor.profile_path && (
          <div className="absolute inset-0 opacity-10">
            <img src={`https://image.tmdb.org/t/p/w780${actor.profile_path}`} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm"
          >
            ← Back
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile photo */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl flex-shrink-0">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${actor.profile_path}`}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-slate-600">👤</div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400 border border-purple-500/40 px-3 py-1 rounded-full bg-purple-500/10">
                  {actor.known_for_department || 'Actor'}
                </span>
                {actor.popularity && (
                  <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                    🔥 {Math.round(actor.popularity)} popularity
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{actor.name}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                {actor.place_of_birth && <span>📍 {actor.place_of_birth}</span>}
                {birthYear && <span>🎂 Born {birthYear}{age ? ` (${age} yrs)` : ''}</span>}
                {combined?.cast && <span>🎬 {combined.cast.length} credits</span>}
              </div>

              {actor.biography && (
                <div>
                  <p className={`text-slate-300 text-sm leading-relaxed ${showBio ? '' : 'line-clamp-4'}`}>
                    {actor.biography}
                  </p>
                  {actor.biography.length > 300 && (
                    <button
                      onClick={() => setShowBio(!showBio)}
                      className="text-purple-400 hover:text-purple-300 text-sm mt-2 transition-colors"
                    >
                      {showBio ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content tabs ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 w-fit">
          {([
            { id: 'movies', label: '🎬 Movies' },
            { id: 'tv',     label: '📺 TV Shows' },
            { id: 'all',    label: '📋 All Credits' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* ── Movies tab ──────────────────────────────────────────────── */}
            {activeTab === 'movies' && (
              <div>
                {/* Movie filters */}
                <div className="space-y-4 mb-6">
                  {/* Row 1: Genre + Year + Sort dropdowns */}
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={movieFilters.genre ?? ''}
                      onChange={(e) => setMovieFilters((f) => ({ ...f, genre: e.target.value ? Number(e.target.value) : undefined }))}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">All Genres</option>
                      {movieGenres.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>

                    <select
                      value={movieFilters.year ?? ''}
                      onChange={(e) => setMovieFilters((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">All Years</option>
                      {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>

                    <select
                      value={movieFilters.sort_by ?? 'popularity.desc'}
                      onChange={(e) => setMovieFilters((f) => ({ ...f, sort_by: e.target.value }))}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {(movieFilters.genre || movieFilters.year || movieFilters.sort_by || movieFilters.language) && (
                      <button
                        onClick={() => setMovieFilters({})}
                        className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-all"
                      >
                        ✕ Clear all
                      </button>
                    )}
                  </div>

                  {/* Row 2: Language pills */}
                  <ActorLanguageFilter
                    label="Language"
                    availableLanguages={availableLanguages}
                    selected={movieFilters.language ?? null}
                    onSelect={(code) => setMovieFilters((f) => ({ ...f, language: code ?? undefined }))}
                  />
                </div>

                <InfiniteCreditsGrid
                  query={movieQuery} type="movie" watchedIds={watchedIds}
                  onAdd={(item) => handleAdd(item, 'movie')}
                  onRemove={(item) => handleRemove(item, 'movie')}
                />
              </div>
            )}

            {/* ── TV tab ──────────────────────────────────────────────────── */}
            {activeTab === 'tv' && (
              <div>
                {/* TV filters */}
                <div className="space-y-4 mb-6">
                  {/* Row 1: Genre + Sort dropdowns */}
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={tvFilters.genre ?? ''}
                      onChange={(e) => setTvFilters((f) => ({ ...f, genre: e.target.value ? Number(e.target.value) : undefined }))}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">All Genres</option>
                      {tvGenres.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>

                    <select
                      value={tvFilters.sort_by ?? 'popularity.desc'}
                      onChange={(e) => setTvFilters((f) => ({ ...f, sort_by: e.target.value }))}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {(tvFilters.genre || tvFilters.sort_by || tvFilters.language) && (
                      <button
                        onClick={() => setTvFilters({})}
                        className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-all"
                      >
                        ✕ Clear all
                      </button>
                    )}
                  </div>

                  {/* Row 2: Language pills */}
                  <ActorLanguageFilter
                    label="Language"
                    availableLanguages={availableLanguages}
                    selected={tvFilters.language ?? null}
                    onSelect={(code) => setTvFilters((f) => ({ ...f, language: code ?? undefined }))}
                  />
                </div>

                <InfiniteCreditsGrid
                  query={tvQuery} type="tv" watchedIds={watchedIds}
                  onAdd={(item) => handleAdd(item, 'tv')}
                  onRemove={(item) => handleRemove(item, 'tv')}
                />
              </div>
            )}

            {/* ── All Credits tab ──────────────────────────────────────────── */}
            {activeTab === 'all' && (
              <div>
                <p className="text-slate-400 text-sm mb-6">{combined?.cast?.length ?? 0} total credits sorted by popularity</p>
                {!combined ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {combined.cast.map((item: any, i: number) => {
                      const type: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie';
                      return (
                        <motion.div key={`${item.id}-${item.credit_id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
                          <ActorMediaCard
                            item={item} type={type}
                            isWatched={watchedIds.has(item.id)}
                            onAdd={() => handleAdd(item, type)}
                            onRemove={() => handleRemove(item, type)}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
