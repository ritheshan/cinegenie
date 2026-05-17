import { X, SpellCheck, Lightbulb, Sparkles } from 'lucide-react';

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
      <div className="w-14 h-14 rounded-full border-2 border-cine-accent flex items-center justify-center text-base font-bold mb-2 text-cine-accent">
        {score}
      </div>
      <span className="text-[9px] font-bold text-cine-text-secondary uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-cine-bg/95 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-cine-surface border border-cine-border rounded p-8 max-w-4xl w-full relative shadow-2xl my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cine-text-muted hover:text-cine-text-primary"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="text-center mb-8 border-b border-cine-border pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-accent mb-2">Speech Evaluation</p>
          <h2 className="text-xl font-bold uppercase tracking-wider text-cine-text-primary font-heading">AI Editorial Analysis</h2>
          <p className="text-xs text-cine-text-secondary mt-1 font-semibold">Assessment of your vocal review journal session</p>
        </div>

        {/* Dynamic Score Shelf */}
        <div className="flex justify-center gap-8 md:gap-16 mb-10">
          <ScoreCircle label="Grammar" score={analysis.grammarScore} />
          <ScoreCircle label="Fluency" score={analysis.fluencyScore} />
          <ScoreCircle label="Vocabulary" score={analysis.vocabularyScore} />
          <ScoreCircle label="Confidence" score={analysis.confidenceScore} />
        </div>

        {/* Feedback Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <div className="bg-cine-bg border border-cine-border p-6 rounded text-left">
              <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <SpellCheck className="w-4 h-4 text-red-400 stroke-[1.75]" /> Grammar Observations
              </h3>
              <ul className="list-disc list-inside text-xs text-cine-text-secondary space-y-2.5 font-semibold">
                {analysis.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                {analysis.mistakes.length === 0 && <li>Excellent grammar. No prominent issues identified.</li>}
              </ul>
            </div>

            <div className="bg-cine-bg border border-cine-border p-6 rounded text-left">
              <h3 className="text-cine-accent text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cine-accent stroke-[1.75]" /> Stylistic Recommendations
              </h3>
              <ul className="list-disc list-inside text-xs text-cine-text-secondary space-y-2.5 font-semibold">
                {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-cine-bg border border-cine-border p-6 rounded flex flex-col justify-between text-left">
            <div>
              <h3 className="text-cine-accent text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cine-accent stroke-[1.75]" /> Polished Adaptation
              </h3>
              <p className="text-xs text-cine-text-secondary leading-relaxed italic border-l border-cine-accent pl-4 py-2 font-medium">
                "{analysis.improvedVersion}"
              </p>
            </div>
            <p className="text-[9px] uppercase tracking-wider text-cine-text-muted mt-6 font-bold">Recommended standard phrasing for natural conversational flow</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-cine-border pt-6 mt-8">
          {onSave ? (
            <>
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded text-[10px] uppercase font-bold tracking-wider text-cine-text-secondary hover:text-cine-text-primary transition-colors bg-cine-bg border border-cine-border"
              >
                Discard
              </button>
              <button 
                onClick={onSave}
                disabled={isSaving}
                className="bg-cine-accent hover:bg-opacity-95 text-cine-bg text-[10px] uppercase font-bold tracking-wider px-6 py-2.5 rounded transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save to Journal'}
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="bg-cine-accent hover:bg-opacity-95 text-cine-bg text-[10px] uppercase font-bold tracking-wider px-6 py-2.5 rounded transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
