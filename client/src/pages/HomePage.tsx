import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movie.api';
import { useAuthStore } from '../store/auth.store';
import MovieScrollingWall from '../components/common/MovieScrollingWall';
import Navbar from '../components/common/Navbar';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      try {
        const [moviesRes] = await Promise.all([
          movieApi.getTrending('movie')
        ]);
        if (moviesRes.success) setTrendingMovies(moviesRes.data.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch trending media:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      {/* Dynamic Background Scrolling Wall */}
      <div className="absolute inset-0 w-full h-[600px] sm:h-[700px] lg:h-[800px] z-0 opacity-40">
        <MovieScrollingWall />
        {/* Soft bottom dark blend mask */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 lg:pt-24 pb-16">
        <div className="max-w-4xl text-center flex flex-col items-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full mb-6 sm:mb-8 animate-fade-in shadow-[0_0_15px_rgba(147,51,234,0.15)]">
            <span className="text-lg">🤖</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              AI-Powered Cinematic Journaling
            </span>
          </div>

          {/* Slogan */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6 text-white max-w-3xl">
            Meet Your Personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-500 to-cyan-400">
              Watch Therapist.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-medium">
            Speak your thoughts, review films, and log your cinematic journey. CineGenie transcribes your natural voice to perform advanced AI emotional, character, and thematic analytics.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_25px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 border border-white/10 group text-base"
              >
                Go to Dashboard
                <span className="group-hover:translate-x-1 transition-transform">➡️</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_25px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 border border-white/10 group text-base"
                >
                  Get Started for Free
                  <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                </Link>
                <Link
                  to="/movies"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-center gap-2 text-base"
                >
                  🎬 Discover Movies
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="max-w-6xl mx-auto w-full mt-24 sm:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-2">
          {/* Feature 1 */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl transition-all hover:translate-y-[-4px] hover:border-purple-500/20 group">
            <div className="text-4xl mb-6 bg-purple-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">🎙️</div>
            <h3 className="text-xl font-bold text-white mb-3">AI Speech Journaling</h3>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-medium">
              Don't type. Just speak your raw feelings, critiques, and realizations after a movie. Our speech processing captures your voice beautifully.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl transition-all hover:translate-y-[-4px] hover:border-cyan-500/20 group">
            <div className="text-4xl mb-6 bg-cyan-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">🧠</div>
            <h3 className="text-xl font-bold text-white mb-3">Thematic Analysis</h3>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-medium">
              CineGenie's artificial intelligence parses your reviews to extract emotional tone, character dynamics, cinematic ratings, and structural themes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl transition-all hover:translate-y-[-4px] hover:border-violet-500/20 group">
            <div className="text-4xl mb-6 bg-violet-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-violet-500/20 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-xl font-bold text-white mb-3">Cinephile Leaderboard</h3>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-medium">
              Climb the ranks by watching films, journaling your reviews, and exchanging insights. Share your archive profile with your friends!
            </p>
          </div>
        </div>

        {/* Trending Section */}
        <div className="max-w-6xl mx-auto w-full mt-28 sm:mt-36">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">🔥 Trending Movies</h2>
              <p className="text-slate-400 text-sm sm:text-base font-medium mt-1">Real-time popular movies curated around the world.</p>
            </div>
            <Link to="/movies" className="text-cyan-400 hover:text-cyan-300 font-bold text-sm sm:text-base flex items-center gap-1 group">
              View All Discover
              <span className="group-hover:translate-x-1 transition-transform">➡️</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 px-2">
              {trendingMovies.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/media/movie/${item.id}`)}
                  className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800/80 cursor-pointer transition-all hover:scale-[1.03] hover:border-slate-700 shadow-lg group relative"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-slate-950 relative">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                        No Poster
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-xs font-bold bg-purple-600 text-white px-2.5 py-1 rounded-lg">View Details</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm truncate">{item.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-400">{item.release_date ? item.release_date.split('-')[0] : 'N/A'}</span>
                      <span className="text-xs font-bold text-yellow-400">★ {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Gorgeous Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎥</span>
            <span className="text-lg font-bold text-white">CineGenie</span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            © {new Date().getFullYear()} CineGenie. Built for cinephiles around the globe.
          </p>
        </div>
      </footer>
    </div>
  );
}
