import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { movieApi } from '../api/movie.api';
import {
  useInfinitePopularMovies,
  useInfinitePopularTv,
  useInfiniteAdvancedDiscover,
  useGenres,
} from '../hooks/useDiscover';
import { useQuery } from '@tanstack/react-query';
import { useWatchedStatus } from '../hooks/useWatched';

import HeroBanner from '../components/discover/HeroBanner';
import InfiniteGrid from '../components/discover/InfiniteGrid';

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

type MediaTab = 'movie' | 'tv';


export default function MoviesPage() {
  const navigate = useNavigate();

  // ── Search query & Filters ──────────────────────────────────────────────────────────
  const [mediaTab, setMediaTab] = useState<MediaTab>('movie');
  const [filters, setFilters] = useState<{ genre?: number | null; language?: string | null; year?: number | null; sort_by?: string }>({ sort_by: 'popularity.desc' });
  const [searchQuery, setSearchQuery] = useState('');

  // ── Search query ────────────────────────────────────────────────────────────
  const searchResult = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => movieApi.searchMovies(searchQuery).then((r) => r.data),
    enabled: searchQuery.trim().length > 1,
    staleTime: 1000 * 60,
  });

  // ── Infinite grid ───────────────────────
  const infPopMovies  = useInfinitePopularMovies();
  const infPopTv      = useInfinitePopularTv();
  const infAdvanced   = useInfiniteAdvancedDiscover(mediaTab, filters);

  const isFiltering = !!(filters.genre || filters.language || filters.year || (filters.sort_by && filters.sort_by !== 'popularity.desc'));
  const isSearchMode = searchQuery.trim().length > 1;

  const { data: genres } = useGenres(mediaTab);

  // Select the right infinite query for the current mode
  const activeInfinite = useMemo(() => {
    if (isFiltering) return infAdvanced;
    return mediaTab === 'movie' ? infPopMovies : infPopTv;
  }, [isFiltering, infAdvanced, mediaTab, infPopMovies, infPopTv]);

  // ── Watched status for infinite items ───────────────────────────────────────────
  // Since we removed horizontal rows, we don't need a massive watchedRowSet for them.
  // InfiniteGrid will still rely on watchedRowSet, but we can just use an empty Set for now 
  // or fetch watched status inside MediaCard directly in the future if needed.
  // For now, let's keep it as an empty Set so it doesn't crash.
  const watchedRowSet = new Set<number>();
  
  // Actually, wait, HeroBanner still needs watched status. We can fetch it if we want,
  // but we need heroItems. Let's just use the first 6 items from the infinite grid as hero!
  const heroItems = activeInfinite.data?.pages?.[0]?.results?.slice(0, 6) ?? [];
  const heroIds = heroItems.map((i: any) => i.id);
  const { data: watchedHeroSet = new Set<number>() } = useWatchedStatus(heroIds, mediaTab);

  // ── Filter handlers ─────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // ── Grid section label ───────────────────────────────────────────────────────
  const gridLabel = useMemo(() => {
    if (isSearchMode) return `Results for "${searchQuery}"`;
    if (isFiltering) return 'Filtered Results';
    return mediaTab === 'movie' ? 'Popular Movies' : 'Popular TV Shows';
  }, [isSearchMode, isFiltering, searchQuery, mediaTab]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <HeroBanner items={heroItems} watchedIds={watchedHeroSet} />

      {/* ── Search & Filter Header ───────────────────────────────────────────── */}
      <div className="px-4 md:px-8 py-6 border-b border-slate-800/60 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full xl:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, series, anything..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-5 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-3 rounded-full transition-colors text-sm"
              >
                Clear
              </button>
            ) : (
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-full transition-colors text-sm font-semibold flex-shrink-0"
              >
                Search
              </button>
            )}
          </form>

          {/* Quick Filters (Type, Sort, Year) - Hidden when searching */}
          {!isSearchMode && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-1 flex-shrink-0">
                {(['movie', 'tv'] as MediaTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setMediaTab(t); setFilters({ sort_by: 'popularity.desc' }); }}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      mediaTab === t ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'movie' ? '🎬 Movies' : '📺 TV'}
                  </button>
                ))}
              </div>

              <select
                value={filters.sort_by || 'popularity.desc'}
                onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500 shadow-sm"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Top Rated</option>
                <option value="release_date.desc">Newest Releases</option>
                <option value="revenue.desc">Highest Grossing</option>
              </select>

              <select
                value={filters.year || ''}
                onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : null }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500 shadow-sm"
              >
                <option value="">All Years</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={filters.genre || ''}
                onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value ? Number(e.target.value) : null }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500 shadow-sm"
              >
                <option value="">All Genres</option>
                {genres?.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              <select
                value={filters.language || ''}
                onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value || null }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-purple-500 shadow-sm"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {isSearchMode ? (
        /* ── Search Results ─────────────────────────────────────────────────── */
        <div className="px-4 md:px-8 pb-16">
          <h2 className="text-xl font-bold mb-4">{gridLabel}</h2>
          {searchResult.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResult.data?.map((item: any, i: number) => {
                const type = item.media_type || mediaTab;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/media/${type}/${item.id}`)}
                  >
                    <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-slate-800 border border-slate-700/50 group-hover:border-purple-500/60 transition-all">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No poster</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate mt-2">{item.title || item.name}</p>
                    <p className="text-xs text-slate-500">{(item.release_date || item.first_air_date || '').substring(0, 4)}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Infinite Grid ─────────────────────────────────────────────────── */}
          <div className="pt-6 pb-16">
            <div className="flex items-center justify-between px-4 md:px-8 mb-5">
              <h2 className="text-xl font-bold text-white">{gridLabel}</h2>
              <AnimatePresence>
                {isFiltering && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setFilters({ sort_by: 'popularity.desc' })}
                    className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-all"
                  >
                    ✕ Clear all filters
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <InfiniteGrid
              pages={activeInfinite.data?.pages}
              isLoading={activeInfinite.isLoading}
              isFetchingNextPage={activeInfinite.isFetchingNextPage}
              hasNextPage={activeInfinite.hasNextPage}
              fetchNextPage={activeInfinite.fetchNextPage}
              mediaType={mediaTab}
              watchedIds={watchedRowSet}
            />
          </div>
        </>
      )}
    </div>
  );
}
