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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Journal</span>
          </h1>
          <p className="text-slate-400">Review your past speaking sessions and AI feedback</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center mt-8">
            <div className="text-5xl mb-4">🎙️</div>
            <h2 className="text-2xl font-bold mb-2">No entries yet</h2>
            <p className="text-slate-400 mb-6">Talk about a movie to create your first journal entry.</p>
            <button
              onClick={() => navigate('/watched')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-full transition-colors"
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
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer hover:border-amber-500/50 transition-all group"
                >
                  {entry.posterPath ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${entry.posterPath}`} 
                      alt={entry.title}
                      className="w-16 h-24 object-cover rounded shadow-md group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500">
                      No img
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{entry.title}</h3>
                      <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-700 rounded">{formatDate(entry.createdAt)}</span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 max-w-2xl italic">
                      "{entry.transcript}"
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center min-w-[80px] mt-4 md:mt-0 p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-2xl font-bold text-amber-400">{avgScore}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Score</span>
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
