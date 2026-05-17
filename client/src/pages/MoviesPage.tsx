import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { movieApi } from '../api/movie.api';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
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

  const [mediaTab, setMediaTab] = useState<MediaTab>('movie');
  const [filters, setFilters] = useState<{ genre?: number | null; language?: string | null; year?: number | null; sort_by?: string }>({ sort_by: 'popularity.desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const searchResult = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => movieApi.searchMovies(searchQuery).then((r) => r.data),
    enabled: searchQuery.trim().length > 1,
    staleTime: 1000 * 60,
  });

  const infPopMovies  = useInfinitePopularMovies();
  const infPopTv      = useInfinitePopularTv();
  const infAdvanced   = useInfiniteAdvancedDiscover(mediaTab, filters);

  const isFiltering = !!(filters.genre || filters.language || filters.year || (filters.sort_by && filters.sort_by !== 'popularity.desc'));
  const isSearchMode = searchQuery.trim().length > 1;

  const { data: genres } = useGenres(mediaTab);

  const activeInfinite = useMemo(() => {
    if (isFiltering) return infAdvanced;
    return mediaTab === 'movie' ? infPopMovies : infPopTv;
  }, [isFiltering, infAdvanced, mediaTab, infPopMovies, infPopTv]);

  const watchedRowSet = new Set<number>();
  
  const heroItems = activeInfinite.data?.pages?.[0]?.results?.slice(0, 6) ?? [];
  const heroIds = heroItems.map((i: any) => i.id);
  const { data: watchedHeroSet = new Set<number>() } = useWatchedStatus(heroIds, mediaTab);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const gridLabel = useMemo(() => {
    if (isSearchMode) return `Results for "${searchQuery}"`;
    if (isFiltering) return 'Filtered Shelf';
    return mediaTab === 'movie' ? 'All Movies' : 'TV Serials';
  }, [isSearchMode, isFiltering, searchQuery, mediaTab]);

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary">
      {/* Editorial Hero Banner */}
      <HeroBanner items={heroItems} watchedIds={watchedHeroSet} />

      {/* Modern Compact Search & Segment Filter Bar */}
      <div className="px-6 md:px-8 py-5 border-b border-cine-border bg-cine-surface sticky top-[68px] z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Elegant Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search films, stars, serials..."
              className="flex-1 bg-cine-bg border border-cine-border rounded px-4 py-2 text-xs text-cine-text-primary placeholder:text-cine-text-muted focus:outline-none focus:border-cine-accent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-cine-card hover:bg-opacity-80 text-cine-text-primary px-4 py-2 rounded text-xs transition-colors font-semibold"
              >
                Clear
              </button>
            )}
          </form>

          {/* Tab & Filter Switches */}
          {!isSearchMode && (
            <div className="flex items-center gap-3">
              {/* Matte Segments */}
              <div className="flex bg-cine-bg border border-cine-border rounded p-0.5">
                {(['movie', 'tv'] as MediaTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setMediaTab(t); setFilters({ sort_by: 'popularity.desc' }); }}
                    className={`px-4 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition-all duration-300 ${
                      mediaTab === t ? 'bg-cine-accent text-cine-bg' : 'text-cine-text-secondary hover:text-cine-text-primary'
                    }`}
                  >
                    {t === 'movie' ? 'Movies' : 'TV Shows'}
                  </button>
                ))}
              </div>

              {/* Collapsible Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded text-[10px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 bg-cine-bg ${
                  showFilters || isFiltering
                    ? 'border-cine-accent text-cine-accent'
                    : 'border-cine-border text-cine-text-secondary hover:text-cine-text-primary'
                }`}
              >
                <span>{isFiltering ? 'Filters (Active)' : 'Filters'}</span>
                {showFilters ? (
                  <ChevronUp className="w-3.5 h-3.5 stroke-[2]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Elegant Filter Accordion Drawer */}
        <AnimatePresence>
          {showFilters && !isSearchMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden max-w-7xl mx-auto"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mt-4 border-t border-cine-border">
                {/* Sort selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-cine-text-muted font-bold">Sort By</span>
                  <select
                    value={filters.sort_by || 'popularity.desc'}
                    onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value }))}
                    className="bg-cine-bg border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
                  >
                    <option value="popularity.desc">Most Popular</option>
                    <option value="vote_average.desc">Top Rated</option>
                    <option value="release_date.desc">Newest Releases</option>
                    <option value="revenue.desc">Highest Grossing</option>
                  </select>
                </div>

                {/* Year selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-cine-text-muted font-bold">Release Year</span>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : null }))}
                    className="bg-cine-bg border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Genre Selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-cine-text-muted font-bold">Genre</span>
                  <select
                    value={filters.genre || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value ? Number(e.target.value) : null }))}
                    className="bg-cine-bg border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
                  >
                    <option value="">All Genres</option>
                    {genres?.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Language Selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-cine-text-muted font-bold">Language</span>
                  <select
                    value={filters.language || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value || null }))}
                    className="bg-cine-bg border border-cine-border rounded px-3 py-2 text-xs font-semibold text-cine-text-secondary focus:outline-none focus:border-cine-accent"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Catalog Display Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {isSearchMode ? (
          /* Search Results */
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-8 font-heading">{gridLabel}</h2>
            {searchResult.isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-cine-surface border border-cine-border rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {searchResult.data?.map((item: any, i: number) => {
                  const type = item.media_type || mediaTab;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group cursor-pointer bg-cine-surface border border-cine-border rounded overflow-hidden transition-all duration-300"
                      onClick={() => navigate(`/media/${type}/${item.id}`)}
                    >
                      <div className="relative aspect-[2/3] bg-cine-bg overflow-hidden">
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cine-text-muted bg-cine-bg text-xs">No Poster</div>
                        )}
                        <div className="absolute inset-0 bg-cine-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-[10px] uppercase font-bold tracking-widest bg-cine-accent text-cine-bg px-3 py-1.5 rounded">View Info</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-semibold text-cine-text-primary truncate uppercase tracking-wider">{item.title || item.name}</p>
                        <p className="text-[10px] text-cine-text-muted mt-1">{(item.release_date || item.first_air_date || '').substring(0, 4)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Infinite Grid catalog */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-cine-text-primary font-heading">{gridLabel}</h2>
              <AnimatePresence>
                {isFiltering && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setFilters({ sort_by: 'popularity.desc' })}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-cine-border px-3 py-1.5 rounded transition-all bg-cine-bg flex items-center gap-1"
                    >
                      <X className="w-3 h-3 stroke-[2]" />
                      <span>Clear all filters</span>
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
        )}
      </div>
    </div>
  );
}
