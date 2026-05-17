import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { entryApi } from '../api/entry.api';
import { watchedApi } from '../api/watched.api';
import { watchedKeys } from '../hooks/useWatched';
import StatsCards from '../components/dashboard/StatsCards';
import ProgressChart from '../components/dashboard/ProgressChart';
import RecentEntries from '../components/dashboard/RecentEntries';
import RecentlyWatched from '../components/dashboard/RecentlyWatched';
import EmptyState from '../components/common/EmptyState';
import { SkeletonStatsCard } from '../components/common/SkeletonCard';
import { Film } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const statsQuery = useQuery({
    queryKey: ['entries', 'stats'],
    queryFn: () => entryApi.getStats().then((r) => r.data),
  });

  const countsQuery = useQuery({
    queryKey: watchedKeys.counts(),
    queryFn: () => watchedApi.getCounts().then((r) => r.data),
  });

  const recentQuery = useQuery({
    queryKey: watchedKeys.recent(),
    queryFn: () => watchedApi.getRecentWatched().then((r) => r.data),
  });

  const loading = statsQuery.isLoading || countsQuery.isLoading || recentQuery.isLoading;
  const error = statsQuery.isError || countsQuery.isError;
  const isCompletelyEmpty = (statsQuery.data?.totalEntries ?? 0) === 0 && (countsQuery.data?.total ?? 0) === 0;

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-accent mb-2">Welcome Back</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary">
            {user?.name || 'Cinephile'}
          </h1>
          <p className="text-xs text-cine-text-secondary mt-1 font-semibold">Track your communication journey and language practice metrics</p>
        </motion.div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonStatsCard key={i} />
              ))}
            </div>
            <div className="bg-cine-surface border border-cine-border rounded p-6 h-80 animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-xs font-bold uppercase tracking-wider">Failed to load dashboard</div>
        ) : isCompletelyEmpty ? (
          <EmptyState
            icon={Film}
            title="Welcome to CineGenie"
            description="Start building your library by finding movies you've watched, then practice speaking about them!"
            actionLabel="Discover Movies"
            onAction={() => navigate('/movies')}
          />
        ) : (
          <div className="space-y-8">
            <StatsCards
              totalWatched={countsQuery.data?.total ?? 0}
              movieCount={countsQuery.data?.movieCount ?? 0}
              tvCount={countsQuery.data?.tvCount ?? 0}
              speakingSessions={statsQuery.data?.totalEntries ?? 0}
              averageFluency={statsQuery.data?.averageScores?.avgFluency ?? 0}
            />

            {(recentQuery.data?.length ?? 0) > 0 && (
              <RecentlyWatched items={recentQuery.data ?? []} />
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProgressChart data={statsQuery.data?.scoreHistory ?? []} />
              </div>
              <div>
                <RecentEntries entries={statsQuery.data?.recentEntries ?? []} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
