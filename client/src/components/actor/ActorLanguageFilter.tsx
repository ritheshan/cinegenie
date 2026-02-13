import { motion } from 'framer-motion';

export const ACTOR_LANGUAGES = [
  { code: null, label: 'All',       flag: '🌍' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'ko', label: 'Korean',    flag: '🇰🇷' },
  { code: 'ja', label: 'Japanese',  flag: '🇯🇵' },
  { code: 'hi', label: 'Hindi',     flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',     flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',    flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada',   flag: '🇮🇳' },
  { code: 'es', label: 'Spanish',   flag: '🇪🇸' },
  { code: 'fr', label: 'French',    flag: '🇫🇷' },
  { code: 'zh', label: 'Chinese',   flag: '🇨🇳' },
] as const;

export type LanguageCode = typeof ACTOR_LANGUAGES[number]['code'];

interface ActorLanguageFilterProps {
  selected: string | null;
  onSelect: (code: string | null) => void;
  label?: string;
  availableLanguages?: string[];
}

export default function ActorLanguageFilter({
  selected,
  onSelect,
  label = 'Language',
  availableLanguages,
}: ActorLanguageFilterProps) {
  return (
    <div>
      {label && (
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      )}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {ACTOR_LANGUAGES.map((lang) => {
          if (availableLanguages && lang.code !== null && !availableLanguages.includes(lang.code)) return null;
          const isActive = selected === lang.code;
          return (
            <motion.button
              key={String(lang.code)}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(isActive ? null : lang.code)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <span className="text-xs">{lang.flag}</span>
              {lang.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
