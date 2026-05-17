import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Mic, X, User, ArrowLeft, Clapperboard, Tv } from 'lucide-react';

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
import Navbar from '../components/common/Navbar';

// ── Shared media card ─────────────────────────────────────────────────────────
function MediaCard({
  item, type, isWatched, onAdd, onRemove,
}: { item: any; type: 'movie' | 'tv'; isWatched: boolean; onAdd: () => void; onRemove: () => void }) {
  const navigate = useNavigate();
  const title = item.title || item.name || 'Untitled';
  const year  = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/media/${type}/${item.id}`)}>
      <div className="relative rounded overflow-hidden aspect-[2/3] bg-cine-bg border border-cine-border group-hover:border-cine-accent transition-all duration-300">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cine-text-muted text-xs uppercase font-bold bg-cine-bg">No poster</div>
        )}
        <div className="absolute inset-0 bg-cine-bg/60 group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center justify-center gap-2">
          {isWatched ? (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-cine-bg hover:bg-red-500 transition-colors" title="Remove Archive">
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-8 h-8 rounded-full bg-cine-accent flex items-center justify-center text-cine-bg hover:opacity-90 transition-all animate-none" title="Log Film">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); navigate(`/media/${type}/${item.id}?talk=true`); }}
            className="w-8 h-8 rounded-full bg-cine-surface flex items-center justify-center text-cine-text-primary hover:bg-cine-card transition-colors border border-cine-border" title="Speak Critique">
            <Mic className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </div>
        {isWatched && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded bg-cine-accent flex items-center justify-center text-cine-bg">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-cine-text-primary group-hover:text-cine-accent transition-colors truncate mt-2">{title}</p>
      <p className="text-[9px] font-bold text-cine-text-muted uppercase tracking-widest mt-0.5">{year}</p>
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
    <section className="mb-10">
      <h2 className="text-xs font-bold uppercase tracking-widest text-cine-text-muted mb-4 px-4 md:px-0">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="min-w-[130px] aspect-[2/3] bg-cine-surface border border-cine-border rounded animate-pulse flex-shrink-0" />
            ))
          : items.slice(0, 18).map((item) => (
              <div key={item.id} className="min-w-[130px] max-w-[130px] flex-shrink-0 snap-start">
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
    return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>;

  if (!items.length)
    return <div className="text-center py-12 text-cine-text-muted text-xs uppercase font-bold tracking-wider">No catalog results found.</div>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item: any, i: number) => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
            <MediaCard item={item} type={type} isWatched={watchedIds.has(item.id)}
              onAdd={() => onAdd(item)} onRemove={() => onRemove(item)} />
          </motion.div>
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-10">
        {query.isFetchingNextPage
          ? <div className="flex items-center gap-2 text-cine-text-secondary text-xs uppercase font-bold tracking-wider"><div className="w-3.5 h-3.5 border border-cine-accent border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading more...</span></div>
          : !query.hasNextPage && items.length > 0 && <p className="text-cine-text-muted text-xs uppercase font-bold tracking-wider">End of catalog reached</p>}
      </div>
    </>
  );
}

// ── Actor chip row ─────────────────────────────────────────────────────────────
function ActorChipRow({ actors, isLoading, selectedId, onSelect }: {
  actors: any[]; isLoading: boolean; selectedId: number | null; onSelect: (id: number | null) => void;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-cine-text-muted flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Star Profiles</span>
        </h2>
        {selectedId && (
          <button onClick={() => onSelect(null)}
            className="text-[9px] font-bold uppercase tracking-wider text-cine-text-muted hover:text-cine-text-primary bg-cine-surface hover:bg-cine-card border border-cine-border px-2 py-0.5 rounded transition-all flex items-center gap-1">
            <X className="w-3 h-3 stroke-[2]" />
            <span>Clear filter</span>
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-cine-surface border border-cine-border animate-pulse" />
                <div className="w-12 h-2.5 bg-cine-surface rounded animate-pulse" />
              </div>
            ))
          : actors.map((actor) => {
              const isActive = selectedId === actor.id;
              return (
                <motion.button
                  key={actor.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onSelect(isActive ? null : actor.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    isActive ? 'border-cine-accent scale-105 shadow-lg shadow-cine-accent/10' : 'border-cine-border group-hover:border-cine-accent'
                  }`}>
                    {actor.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name}
                        className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User className="w-6 h-6 stroke-[1.25] text-cine-text-muted/65" />
                    )}
                  </div>
                  <p className={`text-[10px] font-bold text-center w-14 truncate transition-colors uppercase tracking-wide ${
                    isActive ? 'text-cine-accent font-black' : 'text-cine-text-secondary group-hover:text-cine-text-primary'
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

  const movieRow   = useLanguageMoviesRow(code);
  const tvRow      = useLanguageTvRow(code);
  const actorsQ    = useLanguageActors(code);

  const langMoviesInf = useInfiniteLanguageMovies(code);
  const langTvInf     = useInfiniteLanguageTv(code);

  const actorMoviesInf = useInfiniteActorMovies(
    selectedActor ?? 0,
    { language: code },
  );
  const actorTvInf = useInfiniteActorTv(
    selectedActor ?? 0,
    { language: code },
  );

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

  const movieGridQuery = selectedActor ? actorMoviesInf : langMoviesInf;
  const tvGridQuery    = selectedActor ? actorTvInf     : langTvInf;

  const selectedActorName = selectedActor
    ? actorsQ.data?.find((a: any) => a.id === selectedActor)?.name
    : null;

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary pb-20">
      <Navbar />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="border-b border-cine-border bg-cine-bg/80 backdrop-blur sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/languages')}
            className="text-[10px] font-bold uppercase tracking-wider text-cine-text-muted hover:text-cine-text-primary transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
            <span>Modules</span>
          </button>
          <div className="flex items-center gap-2 border-l border-cine-border pl-4">
            <span className="text-xl p-1 bg-cine-surface border border-cine-border rounded">{langInfo?.flag}</span>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-cine-text-primary leading-none">{langInfo?.label ?? code.toUpperCase()}</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-cine-text-muted mt-0.5">{langInfo?.hero}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">

        {/* ── Top rows (only shown when no actor selected) ───────────────── */}
        {!selectedActor && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LangMediaRow
                title={`Featured ${langInfo?.label} Cinema`}
                items={movieRow.data ?? []} isLoading={movieRow.isLoading}
                type="movie" watchedIds={watchedIds}
                onAdd={(item) => handleAdd(item, 'movie')}
                onRemove={(item) => handleRemove(item, 'movie')}
              />
              <LangMediaRow
                title={`Featured ${langInfo?.label} TV Shows`}
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
            className="mb-6 bg-cine-accent/5 border border-cine-accent/30 rounded px-5 py-3 flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cine-accent animate-pulse" />
            <p className="text-xs text-cine-accent font-bold uppercase tracking-wider">
              Showing <span className="text-cine-text-primary font-black">{langInfo?.label}</span> module for{' '}
              <span className="text-cine-text-primary font-black">{selectedActorName}</span>
            </p>
            <button onClick={() => setSelectedActor(null)}
              className="ml-auto text-[9px] font-bold uppercase tracking-wider text-cine-text-muted hover:text-cine-text-primary bg-cine-surface px-3 py-1 rounded border border-cine-border transition-colors flex items-center gap-1">
              <X className="w-3 h-3 stroke-[2]" />
              <span>Clear</span>
            </button>
          </motion.div>
        )}

        {/* ── Tab switcher ──────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 bg-cine-surface p-1 rounded border border-cine-border w-fit">
          {([
            { id: 'movies', label: 'Movies', icon: Clapperboard },
            { id: 'tv',     label: 'TV Shows', icon: Tv },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all border flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-cine-accent text-cine-bg border-cine-accent'
                    : 'text-cine-text-secondary hover:text-cine-text-primary border-transparent hover:bg-cine-card bg-transparent'
                }`}>
                <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
