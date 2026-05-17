import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { useGenres } from '../hooks/useDiscover';
import { Film, Check, Mic, Plus } from 'lucide-react';

import { watchedKeys, useRemoveWatched } from '../hooks/useWatched';
import { useToastContext } from '../components/common/ToastContext';
import SkeletonCard from '../components/common/SkeletonCard';

const LANGUAGES = [
  { code: 'en',   label: 'English',  flag: '🇺🇸' },
  { code: 'hi',   label: 'Hindi',    flag: '🇮🇳' },
  { code: 'kn',   label: 'Kannada',  flag: '🇮🇳' },
  { code: 'ml',   label: 'Malayalam',flag: '🇮🇳' },
  { code: 'te',   label: 'Telugu',   flag: '🇮🇳' },
  { code: 'ta',   label: 'Tamil',    flag: '🇮🇳' },
  { code: 'ko',   label: 'Korean',   flag: '🇰🇷' },
  { code: 'ja',   label: 'Japanese', flag: '🇯🇵' },
  { code: 'es',   label: 'Spanish',  flag: '🇪🇸' },
  { code: 'fr',   label: 'French',   flag: '🇫🇷' },
  { code: 'zh',   label: 'Chinese',  flag: '🇨🇳' },
];

type LibraryTab = 'all' | 'movie' | 'tv';

const TABS: { id: LibraryTab; label: string }[] = [
  { id: 'all',   label: 'All Titles' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv',    label: 'TV Series' },
];

export default function WatchedPage() {
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const removeWatched = useRemoveWatched();

  const typeParam = activeTab === 'all' ? undefined : activeTab;

  const watchedQuery = useQuery({
    queryKey: watchedKeys.list(activeTab),
    queryFn: async () => {
      const url = typeParam ? `/watched?type=${typeParam}&limit=1000` : '/watched?limit=1000';
      const r = await apiClient.get(url);
      return r.data.data;
    },
  });

  const rawItems: any[] = watchedQuery.data?.items ?? [];
  
  const [filterYear, setFilterYear] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterActor, setFilterActor] = useState('');

  const { data: genres } = useGenres(activeTab === 'tv' ? 'tv' : 'movie');

  const items = useMemo(() => {
    return rawItems.filter(item => {
      if (filterYear && !item.releaseDate?.startsWith(filterYear)) return false;
      if (filterLang && item.language !== filterLang) return false;
      if (filterGenre && !item.genres?.includes(Number(filterGenre)) && !item.genres?.includes(filterGenre)) return false;
      if (filterActor) {
        const actorMatch = item.actors?.some((a: string) => a.toLowerCase().includes(filterActor.toLowerCase()));
        if (!actorMatch) return false;
      }
      return true;
    });
  }, [rawItems, filterYear, filterLang, filterGenre, filterActor]);

  const total: number = items.length;

  const handleRemove = useCallback(async (item: any) => {
    try {
      qc.setQueryData(watchedKeys.list(activeTab), (old: any) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((i: any) => i.mediaId !== item.mediaId) };
      });
      await removeWatched.mutateAsync({ mediaId: item.mediaId, mediaType: item.mediaType });
      addToast(`Removed from library`, 'info');
    } catch {
      addToast('Failed to remove', 'error');
      watchedQuery.refetch();
    }
  }, [activeTab, qc, removeWatched, addToast, watchedQuery]);

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Editorial Title Section */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-text-muted mb-2">Cinematic Memory Archive</p>
              <h1 className="text-3xl sm:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary">
                My Library
              </h1>
              <p className="text-xs text-cine-text-secondary mt-1 font-semibold">
                {total > 0 ? `${total} title${total !== 1 ? 's' : ''} logged` : 'Your catalog is empty'}
              </p>
            </div>
            <button
              onClick={() => navigate('/movies')}
              className="px-5 py-2 text-xs uppercase tracking-wider font-bold bg-cine-accent text-cine-bg hover:bg-opacity-95 rounded transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>Discover Films</span>
            </button>
          </div>
        </motion.div>

        {/* Dynamic Filters Row & Tab Segments */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8 border-b border-cine-border pb-6">
          {/* Matte Tab Segments */}
          <div className="flex bg-cine-surface border border-cine-border rounded p-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFilterGenre('');
                }}
                className={`px-4 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-cine-accent text-cine-bg'
                    : 'text-cine-text-secondary hover:text-cine-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inline Editorial Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="bg-cine-surface border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
            >
              <option value="">All Years</option>
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filterGenre}
              onChange={e => setFilterGenre(e.target.value)}
              className="bg-cine-surface border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
            >
              <option value="">All Genres</option>
              {genres?.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <select
              value={filterLang}
              onChange={e => setFilterLang(e.target.value)}
              className="bg-cine-surface border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter Actor..."
              value={filterActor}
              onChange={e => setFilterActor(e.target.value)}
              className="bg-cine-surface border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-primary placeholder:text-cine-text-muted focus:outline-none focus:border-cine-accent"
            />
          </div>
        </div>

        {/* Cinematic Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {watchedQuery.isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-cine-surface border border-cine-border rounded p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
                <Film className="w-8 h-8 text-cine-text-muted/65 mb-4 stroke-[1.25]" />
                <h2 className="text-lg font-bold uppercase tracking-wider mb-2 font-heading">Empty Collection</h2>
                <p className="text-xs text-cine-text-secondary mb-6 leading-relaxed">
                  Start logging your movie reviews and speech journals to build your premium personal cinematic archive shelf.
                </p>
                <button
                  onClick={() => navigate('/movies')}
                  className="px-6 py-2.5 text-xs uppercase tracking-wider font-bold bg-cine-accent text-cine-bg hover:bg-opacity-95 rounded transition-all"
                >
                  Discover Films
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {items.map((item: any, i: number) => {
                  const title = item.title || item.name;
                  const year = item.releaseDate?.substring(0, 4) || '';

                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className="group cursor-pointer bg-cine-surface border border-cine-border rounded overflow-hidden transition-all duration-300"
                      onClick={() => navigate(`/media/${item.mediaType}/${item.mediaId}`)}
                    >
                      <div className="relative aspect-[2/3] bg-cine-bg overflow-hidden">
                        {item.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w400${item.posterPath}`}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cine-text-muted bg-cine-bg text-xs">No Poster</div>
                        )}

                        {/* Minimalist Top Check Tag */}
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-cine-bg shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>

                        {/* High-End Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-cine-bg/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/media/${item.mediaType}/${item.mediaId}?talk=true`); }}
                            className="w-full py-2 bg-cine-accent text-cine-bg text-[10px] uppercase font-bold tracking-wider hover:bg-opacity-95 rounded transition-all text-center flex items-center justify-center gap-1"
                          >
                            <Mic className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span>Talk Review</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                            className="w-full py-2 bg-cine-bg border border-cine-border text-red-400 text-[10px] uppercase font-bold tracking-wider hover:bg-cine-card rounded transition-all text-center"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-xs font-semibold text-cine-text-primary truncate uppercase tracking-wider">{title}</p>
                        <div className="flex justify-between items-center mt-1 text-[10px] text-cine-text-muted font-bold">
                          <span>{year}</span>
                          <span className="uppercase tracking-wider">
                            {item.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
