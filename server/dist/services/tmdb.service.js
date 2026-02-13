"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmdbService = exports.TmdbService = void 0;
const axios_1 = __importDefault(require("axios"));
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const tmdbClient = axios_1.default.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});
// Retry interceptor for rate limits / transient errors
tmdbClient.interceptors.response.use((response) => response, async (error) => {
    const config = error.config;
    if (!config)
        return Promise.reject(error);
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount < 3) {
        config.__retryCount += 1;
        let delay = 1000 * config.__retryCount;
        if (error.response?.status === 429 && error.response.headers['retry-after']) {
            delay = parseInt(error.response.headers['retry-after'], 10) * 1000;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return tmdbClient(config);
    }
    return Promise.reject(error);
});
class TmdbService {
    // ── Existing ────────────────────────────────────────────────────
    async getTrendingMovies() {
        const response = await tmdbClient.get('/trending/movie/week');
        return response.data.results;
    }
    async getTrendingTv() {
        const response = await tmdbClient.get('/trending/tv/week');
        return response.data.results;
    }
    async searchMulti(query) {
        const response = await tmdbClient.get('/search/multi', { params: { query } });
        return response.data.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
    }
    async getMovieDetails(id) {
        const response = await tmdbClient.get(`/movie/${id}`);
        return response.data;
    }
    async getTvDetails(id) {
        const response = await tmdbClient.get(`/tv/${id}`);
        return response.data;
    }
    // ── Discover / Paginated ─────────────────────────────────────────
    async getTrendingAll(page = 1) {
        const response = await tmdbClient.get('/trending/all/week', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getPopularMovies(page = 1) {
        const response = await tmdbClient.get('/movie/popular', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getPopularTv(page = 1) {
        const response = await tmdbClient.get('/tv/popular', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getTopRatedMovies(page = 1) {
        const response = await tmdbClient.get('/movie/top_rated', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getTopRatedTv(page = 1) {
        const response = await tmdbClient.get('/tv/top_rated', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getNowPlaying(page = 1) {
        const response = await tmdbClient.get('/movie/now_playing', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getByGenre(genreId, type, page = 1) {
        const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
        const response = await tmdbClient.get(endpoint, {
            params: { with_genres: genreId, page },
        });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getGenreList(type) {
        const endpoint = type === 'tv' ? '/genre/tv/list' : '/genre/movie/list';
        const response = await tmdbClient.get(endpoint);
        return response.data.genres;
    }
    async getByLanguage(langCode, type, page = 1) {
        const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
        const response = await tmdbClient.get(endpoint, {
            params: { with_original_language: langCode, page, sort_by: 'popularity.desc' },
        });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async advancedDiscover(type, params, page = 1) {
        const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
        let sortBy = params.sort_by || 'popularity.desc';
        if (sortBy === 'release_date.desc') {
            sortBy = type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
        }
        const queryParams = { page, sort_by: sortBy };
        if (params.genre)
            queryParams.with_genres = params.genre;
        if (params.language)
            queryParams.with_original_language = params.language;
        if (params.year) {
            if (type === 'movie')
                queryParams.primary_release_year = params.year;
            else
                queryParams.first_air_date_year = params.year;
        }
        const response = await tmdbClient.get(endpoint, { params: queryParams });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    // ── Actor endpoints ──────────────────────────────────────────────────────
    async searchActors(query) {
        const response = await tmdbClient.get('/search/person', {
            params: { query, include_adult: false },
        });
        return response.data.results;
    }
    async getPopularActors(page = 1) {
        const response = await tmdbClient.get('/person/popular', { params: { page } });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getActorDetails(actorId) {
        const response = await tmdbClient.get(`/person/${actorId}`, {
            params: { append_to_response: 'images' },
        });
        return response.data;
    }
    async getActorCombinedCredits(actorId) {
        const response = await tmdbClient.get(`/person/${actorId}/combined_credits`);
        const credits = response.data;
        // Sort cast by popularity and deduplicate by id
        const seen = new Set();
        const cast = [...(credits.cast ?? [])].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).filter((c) => {
            if (seen.has(c.id))
                return false;
            seen.add(c.id);
            return true;
        });
        return { cast };
    }
    async getActorMovies(actorId, page = 1, genreId, year, sortBy = 'popularity.desc', language) {
        const params = { with_cast: actorId, page, sort_by: sortBy };
        if (genreId)
            params.with_genres = genreId;
        if (year)
            params.primary_release_year = year;
        if (language)
            params.with_original_language = language;
        const response = await tmdbClient.get('/discover/movie', { params });
        return { results: response.data.results, totalPages: response.data.total_pages };
    }
    async getActorTv(actorId, page = 1, genreId, sortBy = 'popularity.desc', language) {
        const response = await tmdbClient.get(`/person/${actorId}/tv_credits`);
        let tvShows = response.data.cast || [];
        const seen = new Set();
        tvShows = tvShows.filter((show) => {
            if (seen.has(show.id))
                return false;
            seen.add(show.id);
            return true;
        });
        if (genreId) {
            tvShows = tvShows.filter((show) => show.genre_ids?.includes(genreId));
        }
        if (language) {
            tvShows = tvShows.filter((show) => show.original_language === language);
        }
        if (sortBy === 'popularity.desc') {
            tvShows.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }
        else if (sortBy === 'vote_average.desc') {
            tvShows.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        }
        else if (sortBy === 'release_date.desc') {
            tvShows.sort((a, b) => new Date(b.first_air_date || 0).getTime() - new Date(a.first_air_date || 0).getTime());
        }
        else if (sortBy === 'release_date.asc') {
            tvShows.sort((a, b) => new Date(a.first_air_date || 0).getTime() - new Date(b.first_air_date || 0).getTime());
        }
        const pageSize = 20;
        const totalPages = Math.ceil(tvShows.length / pageSize) || 1;
        const paginatedResults = tvShows.slice((page - 1) * pageSize, page * pageSize);
        return { results: paginatedResults, totalPages };
    }
    // ── Advanced Actor Discovery (Extract from Media) ────────────────────────
    /**
     * Paginated actor extraction from media filtered by language and/or genre.
     * page=1 → TMDB movie/TV page 1 (titles 1-5 each)
     */
    async getActorsByFilter(language, genre, page = 1) {
        if (!language && !genre) {
            return this.getPopularActorsPaginated(page);
        }
        const params = { sort_by: 'popularity.desc', page };
        if (language)
            params.with_original_language = language;
        if (genre)
            params.with_genres = genre;
        const [moviesRes, tvRes] = await Promise.all([
            tmdbClient.get('/discover/movie', { params }),
            tmdbClient.get('/discover/tv', { params }),
        ]);
        const totalMoviePages = moviesRes.data.total_pages ?? 1;
        const totalTvPages = tvRes.data.total_pages ?? 1;
        const hasMore = page < Math.max(totalMoviePages, totalTvPages);
        // Take first 5 from each
        const movieIds = moviesRes.data.results.slice(0, 5).map((m) => m.id);
        const tvIds = tvRes.data.results.slice(0, 5).map((t) => t.id);
        const creditRequests = [
            ...movieIds.map((id) => tmdbClient.get(`/movie/${id}/credits`).catch(() => null)),
            ...tvIds.map((id) => tmdbClient.get(`/tv/${id}/credits`).catch(() => null)),
        ];
        const creditResponses = await Promise.all(creditRequests);
        const actorMap = new Map();
        for (const res of creditResponses) {
            if (!res)
                continue;
            const cast = res.data.cast ?? [];
            for (const person of cast.slice(0, 12)) {
                if (!person.profile_path)
                    continue;
                const existing = actorMap.get(person.id);
                if (existing)
                    existing.count += 1;
                else
                    actorMap.set(person.id, { actor: person, count: 1 });
            }
        }
        const actors = [...actorMap.values()]
            .sort((a, b) => (b.count * (b.actor.popularity ?? 0)) - (a.count * (a.actor.popularity ?? 0)))
            .map((e) => e.actor);
        return { actors, hasMore };
    }
    /** Paginated popular actors from TMDB /person/popular */
    async getPopularActorsPaginated(page = 1) {
        const response = await tmdbClient.get('/person/popular', { params: { page } });
        return {
            actors: response.data.results,
            hasMore: page < (response.data.total_pages ?? 1),
        };
    }
}
exports.TmdbService = TmdbService;
exports.tmdbService = new TmdbService();
