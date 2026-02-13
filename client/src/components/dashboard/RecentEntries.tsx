import { motion } from 'framer-motion';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
    >
      <h3 className="text-lg font-bold text-white mb-6">Recent Journal Entries</h3>
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
            >
              {entry.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${entry.posterPath}`}
                  alt={entry.title}
                  className="w-12 h-16 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-16 rounded bg-slate-600 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                  N/A
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{entry.title}</p>
                <p className="text-xs text-slate-400">
                  {entry.mediaType === 'tv' ? '📺 Series' : '🎬 Movie'} • {date}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-lg font-bold ${avgScore >= 70 ? 'text-emerald-400' : avgScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  {avgScore}%
                </p>
                <p className="text-xs text-slate-500">Score</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
