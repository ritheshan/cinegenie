import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES } from '../api/language.api';

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

const GRADIENTS: Record<string, string> = {
  en: 'from-blue-600 to-indigo-700',
  ko: 'from-rose-600 to-pink-700',
  ja: 'from-red-600 to-orange-600',
  hi: 'from-orange-500 to-amber-600',
  ta: 'from-violet-600 to-purple-700',
  te: 'from-emerald-600 to-teal-700',
  ml: 'from-cyan-600 to-sky-700',
  kn: 'from-yellow-500 to-orange-600',
  es: 'from-red-700 to-rose-800',
  fr: 'from-blue-700 to-violet-700',
  zh: 'from-red-800 to-rose-900',
};

export default function LanguagesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Browse by Language
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Discover cinema from around the world. Select a language to explore movies, TV series, and actors.
          </p>
        </motion.div>

        {/* Language cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUPPORTED_LANGUAGES.map((lang, i) => {
            const gradient = GRADIENTS[lang.code] ?? 'from-slate-600 to-slate-700';
            const highlights = CINEMA_HIGHLIGHTS[lang.code] ?? [];

            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/languages/${lang.code}`)}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-left shadow-xl group`}
              >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{lang.flag}</span>
                    <div>
                      <h2 className="text-xl font-black text-white">{lang.label}</h2>
                      <p className="text-white/60 text-sm font-medium">{lang.hero}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {highlights.map((h) => (
                      <span key={h} className="text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-1 text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
                    Explore {lang.label} Cinema
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
