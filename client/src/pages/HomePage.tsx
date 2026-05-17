import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movie.api';
import { useAuthStore } from '../store/auth.store';
import Navbar from '../components/common/Navbar';
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-cine-bg text-cine-text-primary flex flex-col relative overflow-x-hidden font-sans">
      {/* Cinematic Fullscreen Hero Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-[65vh] md:h-[85vh] z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop')` }}
        />
        {/* Soft dark matte linear overlay blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-cine-bg/10 via-cine-bg/70 to-cine-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-transparent to-cine-bg opacity-80" />
      </div>

      <Navbar />

      {/* Editorial Hero Content */}
      <main className="flex-1 flex flex-col relative z-10">
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-20 md:pt-32 pb-16 w-full flex flex-col items-start text-left">
          <div className="max-w-3xl">
            {/* Minimalistic Section Prefix */}
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cine-accent mb-4">
              AI Cinematic Journaling
            </p>

            {/* Premium Slogan */}
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] text-cine-text-primary mb-6 font-heading uppercase">
              Track the films <br />
              that shaped you.
            </h1>

            <p className="text-base sm:text-lg text-cine-text-secondary max-w-xl leading-relaxed mb-10 font-medium">
              Speak your thoughts. Log your cinematic journey. CineGenie captures your raw voice transcripts to perform premium emotional, character, and thematic analytics.
            </p>

            {/* Matte Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 bg-cine-accent text-cine-bg text-xs uppercase tracking-widest font-bold hover:bg-opacity-90 rounded transition-all text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 bg-cine-accent text-cine-bg text-xs uppercase tracking-widest font-bold hover:bg-opacity-90 rounded transition-all text-center"
                  >
                    Start Journaling
                  </Link>
                  <Link
                    to="/movies"
                    className="px-8 py-3.5 bg-cine-surface border border-cine-border text-cine-text-primary text-xs uppercase tracking-widest font-bold hover:bg-cine-card rounded transition-all text-center"
                  >
                    Explore Films
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Feature Cards Showcase - Editorial Layout */}
        <section className="bg-cine-surface border-y border-cine-border py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-text-muted mb-8">Features</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div>
                <span className="text-xs font-bold text-cine-accent tracking-widest uppercase block mb-3">01 / Audio Journaling</span>
                <h3 className="text-lg font-bold text-cine-text-primary mb-3 uppercase tracking-wider font-heading">Speak Your Mind</h3>
                <p className="text-cine-text-secondary text-sm leading-relaxed font-medium">
                  Don't type. Just speak your raw feelings, critiques, and realizations after a movie. Our speech processing captures your voice beautifully.
                </p>
              </div>

              {/* Feature 2 */}
              <div>
                <span className="text-xs font-bold text-cine-accent tracking-widest uppercase block mb-3">02 / Theme Parsing</span>
                <h3 className="text-lg font-bold text-cine-text-primary mb-3 uppercase tracking-wider font-heading">Thematic Analytics</h3>
                <p className="text-cine-text-secondary text-sm leading-relaxed font-medium">
                  CineGenie's artificial intelligence parses your reviews to extract emotional tone, character dynamics, cinematic ratings, and structural themes.
                </p>
              </div>

              {/* Feature 3 */}
              <div>
                <span className="text-xs font-bold text-cine-accent tracking-widest uppercase block mb-3">03 / Scoreboards</span>
                <h3 className="text-lg font-bold text-cine-text-primary mb-3 uppercase tracking-wider font-heading">Annual Leaderboards</h3>
                <p className="text-cine-text-secondary text-sm leading-relaxed font-medium">
                  Climb the ranks by watching films, journaling your reviews, and exchanging insights. Share your archive profile with your friends!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Section - Cinematic Rails */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20 w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-text-muted">Discover</p>
              <h2 className="text-2xl font-bold text-cine-text-primary font-heading uppercase tracking-wide">Trending This Week</h2>
            </div>
            <Link to="/movies" className="text-[10px] font-bold uppercase tracking-widest text-cine-accent hover:text-opacity-80 transition-colors flex items-center gap-1">
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-cine-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {trendingMovies.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/media/movie/${item.id}`)}
                  className="group cursor-pointer bg-cine-surface border border-cine-border overflow-hidden rounded transition-all duration-300"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-cine-bg relative">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cine-text-muted bg-cine-bg text-xs">
                        No Poster
                      </div>
                    )}
                    {/* Soft poster hover tint */}
                    <div className="absolute inset-0 bg-cine-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-cine-accent text-cine-bg px-3 py-1.5 rounded">View Info</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-cine-text-primary text-xs truncate uppercase tracking-wider">{item.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] font-medium text-cine-text-muted">{item.release_date ? item.release_date.split('-')[0] : 'N/A'}</span>
                      <span className="text-[10px] font-bold text-cine-accent">★ {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-cine-border bg-cine-surface py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-cine-text-primary font-heading">Cine<span className="text-cine-accent">Genie</span></span>
          </div>
          <p className="text-cine-text-muted text-[10px] font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} CineGenie. Built for cinephiles globally.
          </p>
        </div>
      </footer>
    </div>
  );
}
