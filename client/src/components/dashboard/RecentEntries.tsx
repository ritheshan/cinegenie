import { motion } from 'framer-motion';
import { MonitorPlay, Clapperboard } from 'lucide-react';

interface RecentEntry {
  _id: string;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  aiAnalysis: {
    grammarScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    confidenceScore: number;
  };
  createdAt: string;
}

interface RecentEntriesProps {
  entries: RecentEntry[];
}

export default function RecentEntries({ entries }: RecentEntriesProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-cine-surface border border-cine-border rounded p-6 shadow-xl"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-accent mb-1">Activity Feed</p>
      <h3 className="text-sm font-bold uppercase tracking-wider text-cine-text-primary mb-6">Recent Journal Entries</h3>
      
      <div className="space-y-4">
        {entries.map((entry, i) => {
          const avgScore = Math.round(
            (entry.aiAnalysis.grammarScore +
              entry.aiAnalysis.fluencyScore +
              entry.aiAnalysis.vocabularyScore +
              entry.aiAnalysis.confidenceScore) /
              4
          );
          const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded bg-cine-bg border border-cine-border hover:border-cine-accent transition-all duration-300 group"
            >
              {entry.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${entry.posterPath}`}
                  alt={entry.title}
                  className="w-10 h-14 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-14 rounded bg-cine-surface border border-cine-border flex items-center justify-center text-[10px] uppercase font-bold text-cine-text-muted flex-shrink-0">
                  N/A
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs uppercase tracking-wider text-cine-text-primary group-hover:text-cine-accent transition-colors truncate">{entry.title}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cine-text-muted mt-1 flex items-center gap-1.5">
                  {entry.mediaType === 'tv' ? (
                    <>
                      <MonitorPlay className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>TV Show</span>
                    </>
                  ) : (
                    <>
                      <Clapperboard className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Film</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{date}</span>
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold font-heading text-cine-accent">
                  {avgScore}%
                </p>
                <p className="text-[8px] font-bold text-cine-text-muted uppercase tracking-widest mt-0.5">Score</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
