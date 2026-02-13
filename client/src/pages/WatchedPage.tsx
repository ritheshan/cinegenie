import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { useGenres } from '../hooks/useDiscover';

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

const TABS: { id: LibraryTab; label: string; icon: string }[] = [
  { id: 'all',   label: 'All',      icon: '🍿' },
  { id: 'movie', label: 'Movies',   icon: '🎬' },
  { id: 'tv',    label: 'TV Shows', icon: '📺' },
];

export default function WatchedPage() {
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const removeWatched = useRemoveWatched();

  const typeParam = activeTab === 'all' ? undefined : activeTab;


  // Proper filtered query
  const watchedQuery = useQuery({
    queryKey: watchedKeys.list(activeTab),
    queryFn: async () => {
      const url = typeParam ? `/watched?type=${typeParam}&limit=1000` : '/watched?limit=1000';
      const r = await apiClient.get(url);
      return r.data.data;
    },
  });

  const rawItems: any[] = watchedQuery.data?.items ?? [];
  
  // Local filter states
  const [filterYear, setFilterYear] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterActor, setFilterActor] = useState('');

  const { data: genres } = useGenres(activeTab === 'tv' ? 'tv' : 'movie');

  // Apply filters client-side
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
      // Optimistic removal from query cache
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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  My Library
                </span>
              </h1>
              <p className="text-slate-400">
                {total > 0 ? `${total} title${total !== 1 ? 's' : ''} tracked` : 'Your personal collection'}
              </p>
            </div>
            <button
              onClick={() => navigate('/movies')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
            >
              + Discover More
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFilterGenre(''); // reset genre since it might be media specific
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Years</option>
            {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterGenre}
            onChange={e => setFilterGenre(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Genres</option>
            {genres?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            value={filterLang}
            onChange={e => setFilterLang(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by Actor..."
            value={filterActor}
            onChange={e => setFilterActor(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500 min-w-[200px]"
          />
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {watchedQuery.isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center mt-4">
                <div className="text-6xl mb-5">
                  {activeTab === 'movie' ? '🎬' : activeTab === 'tv' ? '📺' : '🍿'}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {activeTab === 'all' ? 'Your library is empty' : `No ${activeTab === 'movie' ? 'movies' : 'TV shows'} yet`}
                </h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  {activeTab === 'all'
                    ? 'Start building your personal movie and TV series collection.'
                    : `Add some ${activeTab === 'movie' ? 'movies' : 'TV shows'} to your library.`}
                </p>
                <button
                  onClick={() => navigate('/movies')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-8 rounded-full transition-colors"
                >
                  Discover Media
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item: any, i: number) => {
                  const title = item.title || item.name;
                  const year = item.releaseDate?.substring(0, 4) || '';

                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      className="group"
                    >
                      <div
                        className="relative rounded-lg overflow-hidden aspect-[2/3] bg-slate-800 border border-slate-700/50 group-hover:border-purple-500/60 transition-all cursor-pointer"
                        onClick={() => navigate(`/media/${item.mediaType}/${item.mediaId}`)}
                      >
                        {item.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w400${item.posterPath}`}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">No Poster</div>
                        )}

                        {/* Watched badge */}
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                          ✓
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                            className="w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center text-white text-sm hover:bg-red-400 transition-colors"
                            title="Remove"
                          >✕</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/media/${item.mediaType}/${item.mediaId}?talk=true`); }}
                            className="w-8 h-8 rounded-full bg-purple-500/90 flex items-center justify-center text-sm hover:bg-purple-400 transition-colors"
                            title="Talk about it"
                          >🎤</button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm font-semibold text-white truncate">{title}</p>
                        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                          <span>{year}</span>
                          <span className={item.mediaType === 'tv' ? 'text-cyan-400' : 'text-purple-400'}>
                            {item.mediaType === 'tv' ? '📺' : '🎬'}
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
