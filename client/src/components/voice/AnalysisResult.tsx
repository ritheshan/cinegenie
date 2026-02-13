interface AnalysisResultProps {
  analysis: {
    grammarScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    confidenceScore: number;
    mistakes: string[];
    suggestions: string[];
    improvedVersion: string;
  };
  onSave?: () => void;
  onClose: () => void;
  isSaving?: boolean;
}

export default function AnalysisResult({ analysis, onSave, onClose, isSaving }: AnalysisResultProps) {
  const ScoreCircle = ({ label, score }: { label: string; score: number }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-xl font-bold mb-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
        {score}
      </div>
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-4xl w-full shadow-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">AI Communication Analysis</h2>
          <p className="text-slate-400">Here is how you sounded talking about the movie!</p>
        </div>

        {/* Scores */}
        <div className="flex justify-center gap-8 md:gap-16 mb-12">
          <ScoreCircle label="Grammar" score={analysis.grammarScore} />
          <ScoreCircle label="Fluency" score={analysis.fluencyScore} />
          <ScoreCircle label="Vocab" score={analysis.vocabularyScore} />
          <ScoreCircle label="Confidence" score={analysis.confidenceScore} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <span>⚠️</span> Grammar Mistakes
              </h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                {analysis.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                {analysis.mistakes.length === 0 && <li>Perfect! No mistakes found.</li>}
              </ul>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-lg">
              <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Tips to Improve
              </h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-lg flex flex-col">
            <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
              <span>✨</span> Native-Sounding Polish
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed italic border-l-4 border-purple-500 pl-4 py-2">
              "{analysis.improvedVersion}"
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700">
          {onSave ? (
            <>
              <button 
                onClick={onClose}
                className="px-6 py-3 rounded text-slate-300 hover:bg-slate-700 transition-colors font-medium"
              >
                Discard
              </button>
              <button 
                onClick={onSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save Entry to Journal'}
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-lg transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
