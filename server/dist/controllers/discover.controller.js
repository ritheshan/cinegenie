"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverController = exports.DiscoverController = void 0;
const discover_service_1 = require("../services/discover.service");
class DiscoverController {
    page(req) {
        return Math.max(1, parseInt(req.query.page) || 1);
    }
    async trending(req, res) {
        try {
            const data = await discover_service_1.discoverService.getTrending(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch trending' });
        }
    }
    async popularMovies(req, res) {
        try {
            const data = await discover_service_1.discoverService.getPopularMovies(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch popular movies' });
        }
    }
    async popularTv(req, res) {
        try {
            const data = await discover_service_1.discoverService.getPopularTv(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch popular TV' });
        }
    }
    async topRatedMovies(req, res) {
        try {
            const data = await discover_service_1.discoverService.getTopRatedMovies(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch top rated movies' });
        }
    }
    async topRatedTv(req, res) {
        try {
            const data = await discover_service_1.discoverService.getTopRatedTv(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch top rated TV' });
        }
    }
    async nowPlaying(req, res) {
        try {
            const data = await discover_service_1.discoverService.getNowPlaying(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch now playing' });
        }
    }
    async genres(req, res) {
        try {
            const type = req.query.type === 'tv' ? 'tv' : 'movie';
            const data = await discover_service_1.discoverService.getGenreList(type);
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch genres' });
        }
    }
    async byGenre(req, res) {
        try {
            const genreId = parseInt(req.params.id);
            const type = req.query.type === 'tv' ? 'tv' : 'movie';
            if (isNaN(genreId)) {
                return res.status(400).json({ success: false, error: 'Invalid genre id' });
            }
            const data = await discover_service_1.discoverService.getByGenre(genreId, type, this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch by genre' });
        }
    }
    async byLanguage(req, res) {
        try {
            const type = req.query.type || 'movie';
            const { code } = req.params;
            const data = await discover_service_1.discoverService.getByLanguage(code, type, this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch by language' });
        }
    }
    async advancedFilter(req, res) {
        try {
            const type = req.query.type || 'movie';
            const filters = {
                genre: req.query.genre ? parseInt(req.query.genre) : undefined,
                language: req.query.language,
                year: req.query.year ? parseInt(req.query.year) : undefined,
                sort_by: req.query.sort_by,
            };
            const data = await discover_service_1.discoverService.advancedDiscover(type, filters, this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch advanced filter' });
        }
    }
    // ── Actor handlers ────────────────────────────────────────────────────────
    async searchActors(req, res) {
        try {
            const q = req.query.q;
            if (!q?.trim())
                return res.status(400).json({ success: false, error: 'Query required' });
            const data = await discover_service_1.discoverService.searchActors(q.trim());
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Actor search failed' });
        }
    }
    async popularActors(req, res) {
        try {
            const data = await discover_service_1.discoverService.getPopularActors(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch popular actors' });
        }
    }
    async popularActorsPaginated(req, res) {
        try {
            const data = await discover_service_1.discoverService.getPopularActorsPaginated(this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch popular actors' });
        }
    }
    async actorDetails(req, res) {
        try {
            const actorId = parseInt(req.params.id);
            const data = await discover_service_1.discoverService.getActorDetails(actorId);
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Actor not found' });
        }
    }
    async actorCombined(req, res) {
        try {
            const actorId = parseInt(req.params.id);
            const data = await discover_service_1.discoverService.getActorCombinedCredits(actorId);
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch actor credits' });
        }
    }
    async actorMovies(req, res) {
        try {
            const actorId = parseInt(req.params.id);
            const genreId = req.query.genre ? parseInt(req.query.genre) : undefined;
            const year = req.query.year ? parseInt(req.query.year) : undefined;
            const sortBy = req.query.sort_by || 'popularity.desc';
            const language = req.query.language || undefined;
            const data = await discover_service_1.discoverService.getActorMovies(actorId, this.page(req), genreId, year, sortBy, language);
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch actor movies' });
        }
    }
    async actorTv(req, res) {
        try {
            const actorId = parseInt(req.params.id);
            const genreId = req.query.genre ? parseInt(req.query.genre) : undefined;
            const sortBy = req.query.sort_by || 'popularity.desc';
            const language = req.query.language || undefined;
            const data = await discover_service_1.discoverService.getActorTv(actorId, this.page(req), genreId, sortBy, language);
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch actor TV' });
        }
    }
    async actorsByFilter(req, res) {
        try {
            const language = req.query.language;
            const genre = req.query.genre ? parseInt(req.query.genre) : undefined;
            const data = await discover_service_1.discoverService.getActorsByFilter(language, genre, this.page(req));
            res.json({ success: true, data });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch filtered actors' });
        }
    }
}
exports.DiscoverController = DiscoverController;
exports.discoverController = new DiscoverController();
