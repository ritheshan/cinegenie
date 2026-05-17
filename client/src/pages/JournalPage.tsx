import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { entryApi } from '../api/entry.api';
import AnalysisResult from '../components/voice/AnalysisResult';
import { useNavigate } from 'react-router-dom';

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const navigate = useNavigate();

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await entryApi.getEntries(1);
      if (res.success) {
        setEntries(res.data.entries);
      }
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        {/* Title Section */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-text-muted mb-2">Review Archive</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary">
            Speech Journal
          </h1>
          <p className="text-xs text-cine-text-secondary mt-1 font-semibold">Your archived speaking sessions & editorial communication evaluations</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-cine-surface border border-cine-border rounded animate-pulse"></div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-cine-surface border border-cine-border rounded p-16 text-center max-w-xl mx-auto">
            <div className="text-4xl mb-4">🎙️</div>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-2 font-heading">No Journal Entries</h2>
            <p className="text-xs text-cine-text-secondary mb-6 leading-relaxed">
              Start talking about movies or TV shows from your collection to generate your first conversational critique session.
            </p>
            <button
              onClick={() => navigate('/watched')}
              className="px-6 py-2.5 text-xs uppercase tracking-wider font-bold bg-cine-accent text-cine-bg hover:bg-opacity-95 rounded transition-all"
            >
              Go to Library
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => {
              const avgScore = Math.round(
                (entry.aiAnalysis.grammarScore +
                  entry.aiAnalysis.fluencyScore +
                  entry.aiAnalysis.vocabularyScore +
                  entry.aiAnalysis.confidenceScore) / 4
              );
              
              return (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-cine-surface hover:bg-cine-card border border-cine-border rounded p-5 flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer hover:border-cine-accent transition-all duration-300 group"
                >
                  {entry.posterPath ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${entry.posterPath}`} 
                      alt={entry.title}
                      className="w-14 h-20 object-cover rounded shadow-md group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-cine-bg border border-cine-border rounded flex items-center justify-center text-[10px] uppercase font-bold text-cine-text-muted">
                      No Poster
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-cine-text-primary group-hover:text-cine-accent transition-colors">{entry.title}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cine-text-muted px-2 py-0.5 bg-cine-bg border border-cine-border rounded">{formatDate(entry.createdAt)}</span>
                    </div>
                    <p className="text-xs text-cine-text-secondary leading-relaxed line-clamp-2 max-w-2xl italic font-medium">
                      "{entry.transcript}"
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center min-w-[70px] mt-4 md:mt-0 p-3 bg-cine-bg border border-cine-border rounded">
                    <span className="text-xl font-bold text-cine-accent">{avgScore}</span>
                    <span className="text-[8px] font-bold text-cine-text-muted uppercase tracking-widest mt-0.5">Rating</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {selectedEntry && (
          <AnalysisResult
            analysis={selectedEntry.aiAnalysis}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>
    </div>
  );
}
