import { motion } from 'framer-motion';
import { Film, Clapperboard, MonitorPlay, AudioLines, Sparkles } from 'lucide-react';

interface StatsCardsProps {
  totalWatched: number;
  movieCount: number;
  tvCount: number;
  speakingSessions: number;
  averageFluency: number;
}

const cards = [
  { key: 'watched', label: 'Total Logged', icon: Film },
  { key: 'movies', label: 'Movies', icon: Clapperboard },
  { key: 'series', label: 'TV Series', icon: MonitorPlay },
  { key: 'sessions', label: 'Oral Sessions', icon: AudioLines },
  { key: 'fluency', label: 'Avg Fluency', icon: Sparkles },
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
      {cards.map((card, i) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded border border-cine-border bg-cine-surface p-5 hover:border-cine-accent transition-all duration-300 group"
          >
            <div className="relative">
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 text-cine-text-muted group-hover:text-cine-accent transition-colors duration-300 stroke-[1.75]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cine-accent/30 group-hover:bg-cine-accent transition-colors" />
              </div>
              <p className="text-2xl font-bold font-heading text-cine-text-primary mt-3 group-hover:text-cine-accent transition-colors">{values[card.key]}</p>
              <p className="text-[9px] font-bold text-cine-text-muted mt-1 uppercase tracking-widest">{card.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
