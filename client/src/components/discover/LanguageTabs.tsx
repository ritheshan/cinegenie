import { motion } from 'framer-motion';

const LANGUAGES = [
  { code: null,   label: 'All',      flag: '🌍' },
  { code: 'en',   label: 'English',  flag: '🇺🇸' },
  { code: 'hi',   label: 'Hindi',    flag: '🇮🇳' },
  { code: 'kn',   label: 'Kannada',  flag: '🇮🇳' },
  { code: 'ml',   label: 'Malayalam',flag: '🇮🇳' },
  { code: "te",   label: "Telugu",   flag: '🇮🇳' },
  { code: "ta",   label: "Tamil",    flag: '🇮🇳' },
  { code: 'ko',   label: 'Korean',   flag: '🇰🇷' },
  { code: 'ja',   label: 'Japanese', flag: '🇯🇵' },
  { code: 'es',   label: 'Spanish',  flag: '🇪🇸' },
  { code: 'fr',   label: 'French',   flag: '🇫🇷' },
  { code: 'zh',   label: 'Chinese',  flag: '🇨🇳' },

] as const;

interface LanguageTabsProps {
  selected: string | null;
  onSelect: (code: string | null) => void;
}

export default function LanguageTabs({ selected, onSelect }: LanguageTabsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-8"
      style={{ scrollbarWidth: 'none' }}
    >
      {LANGUAGES.map((lang) => (
        <motion.button
          key={lang.label}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(lang.code === selected ? null : lang.code)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            selected === lang.code
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <span>{lang.flag}</span>
          {lang.label}
        </motion.button>
      ))}
    </div>
  );
}
