import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard.api';

type LeaderboardTab = 'movie' | 'tv' | 'communication';

const TABS: { id: LeaderboardTab; label: string; icon: string; description: string }[] = [
  { id: 'movie', label: 'Top Cinephiles', icon: '🎬', description: 'Most movies watched' },
  { id: 'tv', label: 'Binge Watchers', icon: '📺', description: 'Most series watched' },
  { id: 'communication', label: 'Master Orators', icon: '🎤', description: 'Highest average AI speaking score' },
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
    valueLabel = 'Movies Watched';
  } else if (activeTab === 'tv') {
    currentData = watchedTv || [];
    isLoading = loadTv;
    valueLabel = 'Series Watched';
  } else if (activeTab === 'communication') {
    currentData = communicationStats || [];
    isLoading = loadComm;
    valueLabel = 'Avg. Score';
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Global Leaderboard
            </span>
            👑
          </h1>
          <p className="text-slate-400 text-lg">See how you stack up against other users</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-base">{tab.label}</span>
              <span className={`text-xs ${activeTab === tab.id ? 'text-purple-200' : 'text-slate-500'}`}>
                {tab.description}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Table Header */}
            <div className="flex items-center px-6 py-4 bg-slate-800/80 border-b border-slate-700 text-sm font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-16 text-center">Rank</div>
              <div className="flex-1 pl-4">User</div>
              <div className="w-32 text-right">{valueLabel}</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-slate-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center px-6 py-5 animate-pulse">
                    <div className="w-16 flex justify-center"><div className="w-8 h-8 bg-slate-700 rounded-full"></div></div>
                    <div className="flex-1 pl-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                      <div className="w-32 h-4 bg-slate-700 rounded"></div>
                    </div>
                    <div className="w-20 h-6 bg-slate-700 rounded ml-auto"></div>
                  </div>
                ))
              ) : currentData.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-4xl mb-4">👻</div>
                  No data available yet
                </div>
              ) : (
                currentData.map((item, i) => {
                  const isTop3 = i < 3;
                  const value = activeTab === 'communication' ? item.averageScore?.toFixed(1) : item.count;
                  
                  return (
                    <div 
                      key={item.userId || item._id} 
                      className={`flex items-center px-6 py-4 transition-colors hover:bg-slate-700/30 ${i === 0 ? 'bg-amber-500/5' : ''}`}
                    >
                      {/* Rank */}
                      <div className="w-16 flex justify-center">
                        {i === 0 ? <span className="text-3xl" title="1st Place">🥇</span> :
                         i === 1 ? <span className="text-3xl" title="2nd Place">🥈</span> :
                         i === 2 ? <span className="text-3xl" title="3rd Place">🥉</span> :
                         <span className="text-lg font-bold text-slate-500">#{i + 1}</span>}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 pl-4 flex items-center gap-4">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isTop3 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {item.name?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className={`font-bold ${isTop3 ? 'text-white text-lg' : 'text-slate-300'}`}>
                          {item.name || 'Anonymous User'}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="w-32 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                          isTop3 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700 text-slate-300'
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
