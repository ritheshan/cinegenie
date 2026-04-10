import { motion } from 'framer-motion';

interface StatsCardsProps {
  totalWatched: number;
  movieCount: number;
  tvCount: number;
  speakingSessions: number;
  averageFluency: number;
}

const cards = [
  { key: 'watched', label: 'Total Watched', icon: '🍿', color: 'from-purple-500 to-indigo-600' },
  { key: 'movies', label: 'Movies', icon: '🎬', color: 'from-cyan-500 to-blue-600' },
  { key: 'series', label: 'TV Series', icon: '📺', color: 'from-pink-500 to-rose-600' },
  { key: 'sessions', label: 'Speaking Sessions', icon: '🎙️', color: 'from-amber-500 to-orange-600' },
  { key: 'fluency', label: 'Avg Fluency', icon: '🎯', color: 'from-emerald-500 to-green-600' },
];

export default function StatsCards({ totalWatched, movieCount, tvCount, speakingSessions, averageFluency }: StatsCardsProps) {
  const values: Record<string, number | string> = {
    watched: totalWatched,
    movies: movieCount,
    series: tvCount,
    sessions: speakingSessions,
    fluency: averageFluency > 0 ? `${Math.round(averageFluency)}%` : '—',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-5"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`} />
          <div className="relative">
            <span className="text-2xl">{card.icon}</span>
            <p className="text-3xl font-bold text-white mt-2">{values[card.key]}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
