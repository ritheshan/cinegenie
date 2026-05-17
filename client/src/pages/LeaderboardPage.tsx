import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard.api';
import Navbar from '../components/common/Navbar';
import { Trophy, Clapperboard, MonitorPlay, Mic } from 'lucide-react';

type LeaderboardTab = 'movie' | 'tv' | 'communication';

const TABS = [
  { id: 'movie' as const, label: 'Top Cinephiles', icon: Clapperboard, description: 'Movies Logged' },
  { id: 'tv' as const, label: 'Binge Watchers', icon: MonitorPlay, description: 'Series Logged' },
  { id: 'communication' as const, label: 'Master Orators', icon: Mic, description: 'AI Oral Score' },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('movie');

  const { data: watchedMovies, isLoading: loadMovies } = useQuery({
    queryKey: ['leaderboard', 'movie'],
    queryFn: () => leaderboardApi.getWatchedLeaderboard('movie'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: watchedTv, isLoading: loadTv } = useQuery({
    queryKey: ['leaderboard', 'tv'],
    queryFn: () => leaderboardApi.getWatchedLeaderboard('tv'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: communicationStats, isLoading: loadComm } = useQuery({
    queryKey: ['leaderboard', 'communication'],
    queryFn: () => leaderboardApi.getCommunicationLeaderboard(),
    staleTime: 1000 * 60 * 5,
  });

  let currentData: any[] = [];
  let isLoading = false;
  let valueLabel = 'Count';

  if (activeTab === 'movie') {
    currentData = watchedMovies || [];
    isLoading = loadMovies;
    valueLabel = 'Movies Logged';
  } else if (activeTab === 'tv') {
    currentData = watchedTv || [];
    isLoading = loadTv;
    valueLabel = 'Series Logged';
  } else if (activeTab === 'communication') {
    currentData = communicationStats || [];
    isLoading = loadComm;
    valueLabel = 'Avg. Oral Score';
  }

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-accent mb-2">Global Ranking</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary mb-3">
            Hall of Fame
          </h1>
          <p className="text-xs text-cine-text-secondary font-semibold max-w-md mx-auto leading-relaxed">
            See how your logged film collections & spoken evaluations stack up against our global community
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 bg-cine-surface p-2 rounded border border-cine-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-4 rounded text-xs uppercase font-bold tracking-wider transition-all border ${
                  isActive
                    ? 'bg-cine-accent text-cine-bg border-cine-accent'
                    : 'text-cine-text-secondary hover:text-cine-text-primary hover:bg-cine-card border-transparent bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 stroke-[1.75] ${isActive ? 'text-cine-bg' : 'text-cine-accent'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isActive ? 'text-cine-bg opacity-75' : 'text-cine-text-muted'}`}>
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-cine-surface border border-cine-border rounded overflow-hidden shadow-xl"
          >
            {/* Table Header */}
            <div className="flex items-center px-6 py-4 bg-cine-bg/50 border-b border-cine-border text-[9px] font-bold text-cine-text-muted uppercase tracking-[0.2em]">
              <div className="w-16 text-center">Rank</div>
              <div className="flex-1 pl-4">Cinephile</div>
              <div className="w-32 text-right">{valueLabel}</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-cine-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center px-6 py-5 animate-pulse bg-cine-bg/25">
                    <div className="w-16 flex justify-center"><div className="w-6 h-6 bg-cine-surface rounded-full"></div></div>
                    <div className="flex-1 pl-4 flex items-center gap-4">
                      <div className="w-8 h-8 bg-cine-surface rounded-full"></div>
                      <div className="w-24 h-3 bg-cine-surface rounded"></div>
                    </div>
                    <div className="w-16 h-5 bg-cine-surface rounded ml-auto"></div>
                  </div>
                ))
              ) : currentData.length === 0 ? (
                <div className="text-center py-16 text-cine-text-muted text-xs uppercase font-bold tracking-wider flex flex-col items-center justify-center">
                  <Trophy className="w-8 h-8 text-cine-text-muted/65 mb-4 stroke-[1.25]" />
                  <span>No active rankings recorded</span>
                </div>
              ) : (
                currentData.map((item, i) => {
                  const isTop3 = i < 3;
                  const value = activeTab === 'communication' ? item.averageScore?.toFixed(1) : item.count;
                  
                  return (
                    <div 
                      key={item.userId || item._id} 
                      className={`flex items-center px-6 py-4 transition-colors hover:bg-cine-card/45 ${i === 0 ? 'bg-cine-accent/5' : ''}`}
                    >
                      <div className="w-16 flex justify-center items-center">
                        {i === 0 ? <span title="Gold Medallion"><Trophy className="w-5.5 h-5.5 text-cine-accent fill-cine-accent/10 stroke-[1.75]" /></span> :
                         i === 1 ? <span title="Silver Medallion"><Trophy className="w-5.5 h-5.5 text-slate-400 fill-slate-400/5 stroke-[1.75]" /></span> :
                         i === 2 ? <span title="Bronze Medallion"><Trophy className="w-5.5 h-5.5 text-amber-700 fill-amber-700/5 stroke-[1.75]" /></span> :
                         <span className="text-xs font-bold text-cine-text-muted">#{i + 1}</span>}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 pl-4 flex items-center gap-3">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full bg-cine-bg border border-cine-border" />
                        ) : (
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] uppercase tracking-wider ${isTop3 ? 'bg-cine-accent text-cine-bg' : 'bg-cine-bg border border-cine-border text-cine-text-secondary'}`}>
                            {item.name?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${isTop3 ? 'text-cine-text-primary' : 'text-cine-text-secondary'}`}>
                          {item.name || 'Anonymous Cinephile'}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="w-32 text-right">
                        <span className={`inline-block px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                          isTop3 ? 'bg-cine-accent/10 border border-cine-accent/30 text-cine-accent' : 'bg-cine-bg border border-cine-border text-cine-text-secondary'
                        }`}>
                          {value}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        
      </div>
    </div>
  );
}
