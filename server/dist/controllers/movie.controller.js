"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieController = exports.MovieController = void 0;
const movie_service_1 = require("../services/movie.service");
class MovieController {
    async getTrending(req, res) {
        try {
            const type = req.query.type;
            let data;
            if (type === 'tv') {
                data = await movie_service_1.movieService.getTrendingTv();
            }
            else {
                data = await movie_service_1.movieService.getTrending();
            }
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch trending media' });
        }
    }
    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({ success: false, error: 'Search query is required' });
            }
            const results = await movie_service_1.movieService.search(q);
            res.json({ success: true, data: results });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to search' });
        }
    }
    async getDetails(req, res) {
        try {
            const { id } = req.params;
            const type = req.query.type === 'tv' ? 'tv' : 'movie';
            const details = await movie_service_1.movieService.getDetails(id, type);
            res.json({ success: true, data: details });
        }
        catch (error) {
            res.status(404).json({ success: false, error: 'Media not found' });
        }
    }
}
exports.MovieController = MovieController;
exports.movieController = new MovieController();
