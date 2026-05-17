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
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-text-muted mb-2">{label}</p>
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
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(isActive ? null : lang.code)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${
                isActive
                  ? 'bg-cine-accent text-cine-bg border-cine-accent'
                  : 'bg-cine-surface text-cine-text-secondary hover:text-cine-text-primary hover:bg-cine-card border-cine-border'
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
