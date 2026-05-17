import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES } from '../api/language.api';
import Navbar from '../components/common/Navbar';

const CINEMA_HIGHLIGHTS: Record<string, string[]> = {
  en: ['Marvel', 'DC', 'Pixar', 'Oscar Winners'],
  ko: ['Parasite', 'Squid Game', 'BTS Films', 'K-Dramas'],
  ja: ['Studio Ghibli', 'Anime', 'J-Dramas', 'Kurosawa'],
  hi: ['Bollywood Hits', 'RRR', 'Dangal', 'Shah Rukh Khan'],
  ta: ['Vijay', 'Rajinikanth', 'Mani Ratnam', 'Kollywood'],
  te: ['SS Rajamouli', 'Prabhas', 'Allu Arjun', 'Tollywood'],
  ml: ['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Mollywood'],
  kn: ['Darshan', 'Yash', 'KGF', 'Sandalwood'],
  es: ['Almodóvar', 'Money Heist', 'Elite', 'Narcos'],
  fr: ['French New Wave', 'Intouchables', 'Amélie', 'Cannes'],
  zh: ['Zhang Yimou', 'Wong Kar-wai', 'C-Dramas', 'Wuxia'],
};

export default function LanguagesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-accent mb-2">Regional modules</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase font-heading tracking-wide text-cine-text-primary mb-3">
            Browse by Language
          </h1>
          <p className="text-xs text-cine-text-secondary font-semibold max-w-xl">
            Explore regional cinema from around the world. Select a language module to study specific films, series, and stars.
          </p>
        </motion.div>

        {/* Language cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_LANGUAGES.map((lang, i) => {
            const highlights = CINEMA_HIGHLIGHTS[lang.code] ?? [];

            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/languages/${lang.code}`)}
                className="relative overflow-hidden rounded border border-cine-border bg-cine-surface p-6 text-left shadow-xl hover:border-cine-accent transition-all duration-300 group"
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl p-2 bg-cine-bg border border-cine-border rounded group-hover:scale-105 transition-transform duration-300">{lang.flag}</span>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-cine-text-primary group-hover:text-cine-accent transition-colors">{lang.label}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-cine-text-muted mt-0.5">{lang.hero}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {highlights.map((h) => (
                        <span key={h} className="text-[9px] font-bold uppercase tracking-widest bg-cine-bg border border-cine-border text-cine-text-secondary px-2.5 py-1 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cine-accent group-hover:underline transition-all">
                    Explore {lang.label} Cinema
                    <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
