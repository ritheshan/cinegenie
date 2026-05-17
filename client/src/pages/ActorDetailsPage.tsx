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
import Navbar from '../components/common/Navbar';
import { 
  Check, Plus, Mic, User, MapPin, 
  CalendarRange, Film, Clapperboard, MonitorPlay, NotebookPen, ArrowLeft, X 
} from 'lucide-react';

type CreditTab = 'movies' | 'tv' | 'all';

const SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Popularity' },
  { value: 'vote_average.desc',   label: 'TMDB Rating' },
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
      <div className="relative rounded overflow-hidden aspect-[2/3] bg-cine-surface border border-cine-border group-hover:border-cine-accent transition-all duration-350">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cine-text-muted text-[10px] uppercase font-bold">No poster</div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-cine-bg/75 transition-all flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100 duration-300">
          {isWatched ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              title="Remove from library"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-8 h-8 rounded-full bg-cine-accent flex items-center justify-center text-cine-bg hover:opacity-90 transition-opacity"
              title="Add to library"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/media/${type}/${item.id}?talk=true`); }}
            className="w-8 h-8 rounded-full bg-cine-surface border border-cine-border flex items-center justify-center hover:text-cine-accent transition-colors text-cine-text-primary"
            title="Talk about it"
          >
            <Mic className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </div>

        {isWatched && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded bg-green-600 flex items-center justify-center text-white">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        )}
      </div>
      <p className="text-[11px] font-bold text-cine-text-primary uppercase tracking-wide truncate mt-2.5 group-hover:text-cine-accent transition-colors">{title}</p>
      <p className="text-[10px] text-cine-text-muted font-bold mt-0.5">{year}</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16 text-cine-text-muted">
        <div className="flex justify-center mb-3">
          {type === 'movie' ? (
            <Clapperboard className="w-8 h-8 stroke-[1.25]" />
          ) : (
            <MonitorPlay className="w-8 h-8 stroke-[1.25]" />
          )}
        </div>
        <p className="text-xs uppercase font-bold tracking-wider">No credits found under active criteria</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item: any, i: number) => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.3) }}>
            <ActorMediaCard
              item={item} type={type}
              isWatched={watchedIds.has(item.id)}
              onAdd={() => onAdd(item)}
              onRemove={() => onRemove(item)}
            />
          </motion.div>
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-12">
        {query.isFetchingNextPage && (
          <div className="flex items-center gap-2.5 text-cine-text-secondary">
            <div className="w-4 h-4 border border-cine-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Loading more credits...</span>
          </div>
        )}
        {!query.hasNextPage && items.length > 0 && (
          <p className="text-cine-text-muted text-[10px] uppercase font-bold tracking-wider">End of catalog reached</p>
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
      <div className="min-h-screen bg-cine-bg flex items-center justify-center">
        <div className="w-10 h-10 border border-cine-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-cine-bg flex items-center justify-center text-cine-text-muted">
        <div className="text-center">
          <User className="w-12 h-12 stroke-[1.25] text-cine-text-muted/65 mx-auto mb-4" />
          <p className="text-base font-bold uppercase tracking-wider mb-2">Artist not found</p>
          <button onClick={() => navigate(-1)} className="text-cine-accent hover:underline text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 justify-center mx-auto">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
            <span>Return</span>
          </button>
        </div>
      </div>
    );
  }

  const birthYear = actor.birthday ? actor.birthday.substring(0, 4) : null;
  const age = actor.birthday && !actor.deathday
    ? new Date().getFullYear() - parseInt(birthYear!)
    : null;

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary">
      <Navbar />

      {/* ── Hero section ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-cine-border">
        {actor.profile_path && (
          <div className="absolute inset-0 opacity-[0.03]">
            <img src={`https://image.tmdb.org/t/p/w780${actor.profile_path}`} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-cine-bg/40 via-cine-bg/85 to-cine-bg" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-cine-text-muted hover:text-cine-text-primary transition-colors mb-8 text-xs uppercase font-bold tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
            <span>Back</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile photo */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-48 h-48 md:w-56 md:h-56 rounded bg-cine-surface border border-cine-border shadow-2xl flex-shrink-0 overflow-hidden">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${actor.profile_path}`}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 stroke-[1.25] text-cine-text-muted/65" />
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cine-accent border border-cine-accent px-3 py-1 rounded bg-cine-accent/5">
                  {actor.known_for_department || 'Actor'}
                </span>
                {actor.popularity && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-cine-text-secondary bg-cine-surface px-3 py-1 rounded border border-cine-border">
                    ★ {Math.round(actor.popularity)} Popularity
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary mb-4 leading-tight">{actor.name}</h1>

              <div className="flex flex-wrap gap-4 text-[10px] text-cine-text-muted font-bold uppercase tracking-wider mb-6">
                {actor.place_of_birth && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cine-text-muted stroke-[2]" />
                    {actor.place_of_birth}
                  </span>
                )}
                {birthYear && (
                  <span className="flex items-center gap-1">
                    <CalendarRange className="w-3.5 h-3.5 text-cine-text-muted stroke-[2]" />
                    Born {birthYear}{age ? ` (${age} Years)` : ''}
                  </span>
                )}
                {combined?.cast && (
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-cine-text-muted stroke-[2]" />
                    {combined.cast.length} Credits
                  </span>
                )}
              </div>

              {actor.biography && (
                <div>
                  <p className={`text-cine-text-secondary text-xs leading-relaxed font-semibold max-w-3xl ${showBio ? '' : 'line-clamp-4'}`}>
                    {actor.biography}
                  </p>
                  {actor.biography.length > 300 && (
                    <button
                      onClick={() => setShowBio(!showBio)}
                      className="text-cine-accent hover:underline text-[10px] uppercase font-bold tracking-wider mt-3.5 transition-colors"
                    >
                      {showBio ? 'Collapse biography ↑' : 'Read full biography ↓'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content tabs ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 border-b border-cine-border pb-3">
          {([
            { id: 'movies', label: 'Movies', icon: Clapperboard },
            { id: 'tv',     label: 'TV Series', icon: MonitorPlay },
            { id: 'all',    label: 'Complete Filmography', icon: NotebookPen },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-cine-accent text-cine-bg border-cine-accent'
                    : 'text-cine-text-secondary hover:text-cine-text-primary hover:bg-cine-card border-transparent bg-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* ── Movies tab ──────────────────────────────────────────────── */}
            {activeTab === 'movies' && (
              <div>
                {/* Movie filters */}
                <div className="space-y-4 mb-8 border-b border-cine-border pb-6">
                  {/* Row 1: Genre + Year + Sort dropdowns */}
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={movieFilters.genre ?? ''}
                      onChange={(e) => setMovieFilters((f) => ({ ...f, genre: e.target.value ? Number(e.target.value) : undefined }))}
                      className="bg-cine-surface border border-cine-border text-cine-text-primary text-[10px] uppercase font-bold tracking-wider rounded px-3.5 py-2 focus:outline-none focus:border-cine-accent transition-colors"
                    >
                      <option value="">All Genres</option>
                      {movieGenres.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>

                    <select
                      value={movieFilters.year ?? ''}
                      onChange={(e) => setMovieFilters((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))}
                      className="bg-cine-surface border border-cine-border text-cine-text-primary text-[10px] uppercase font-bold tracking-wider rounded px-3.5 py-2 focus:outline-none focus:border-cine-accent transition-colors"
                    >
                      <option value="">All Years</option>
                      {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>

                    <select
                      value={movieFilters.sort_by ?? 'popularity.desc'}
                      onChange={(e) => setMovieFilters((f) => ({ ...f, sort_by: e.target.value }))}
                      className="bg-cine-surface border border-cine-border text-cine-text-primary text-[10px] uppercase font-bold tracking-wider rounded px-3.5 py-2 focus:outline-none focus:border-cine-accent transition-colors"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {(movieFilters.genre || movieFilters.year || movieFilters.sort_by || movieFilters.language) && (
                      <button
                        onClick={() => setMovieFilters({})}
                        className="text-[9px] uppercase tracking-wider font-bold text-cine-text-secondary hover:text-cine-text-primary bg-cine-surface border border-cine-border px-3.5 py-2 rounded transition-all flex items-center gap-1"
                      >
                        <X className="w-3 h-3 stroke-[2]" />
                        <span>Clear Criteria</span>
                      </button>
                    )}
                  </div>

                  {/* Row 2: Language pills */}
                  <ActorLanguageFilter
                    label="Filter by Language"
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
                <div className="space-y-4 mb-8 border-b border-cine-border pb-6">
                  {/* Row 1: Genre + Sort dropdowns */}
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={tvFilters.genre ?? ''}
                      onChange={(e) => setTvFilters((f) => ({ ...f, genre: e.target.value ? Number(e.target.value) : undefined }))}
                      className="bg-cine-surface border border-cine-border text-cine-text-primary text-[10px] uppercase font-bold tracking-wider rounded px-3.5 py-2 focus:outline-none focus:border-cine-accent transition-colors"
                    >
                      <option value="">All Genres</option>
                      {tvGenres.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>

                    <select
                      value={tvFilters.sort_by ?? 'popularity.desc'}
                      onChange={(e) => setTvFilters((f) => ({ ...f, sort_by: e.target.value }))}
                      className="bg-cine-surface border border-cine-border text-cine-text-primary text-[10px] uppercase font-bold tracking-wider rounded px-3.5 py-2 focus:outline-none focus:border-cine-accent transition-colors"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {(tvFilters.genre || tvFilters.sort_by || tvFilters.language) && (
                      <button
                        onClick={() => setTvFilters({})}
                        className="text-[9px] uppercase tracking-wider font-bold text-cine-text-secondary hover:text-cine-text-primary bg-cine-surface border border-cine-border px-3.5 py-2 rounded transition-all flex items-center gap-1"
                      >
                        <X className="w-3 h-3 stroke-[2]" />
                        <span>Clear Criteria</span>
                      </button>
                    )}
                  </div>

                  {/* Row 2: Language pills */}
                  <ActorLanguageFilter
                    label="Filter by Language"
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
                <p className="text-cine-text-muted text-[10px] uppercase font-bold tracking-widest mb-6">{combined?.cast?.length ?? 0} Total Credits sorted by prominence</p>
                {!combined ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {combined.cast.map((item: any, i: number) => {
                      const type: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie';
                      return (
                        <motion.div key={`${item.id}-${item.credit_id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.3) }}>
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
