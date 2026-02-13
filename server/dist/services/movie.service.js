"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieService = exports.MovieService = void 0;
const tmdb_service_1 = require("./tmdb.service");
class MovieService {
    async getTrending() {
        return tmdb_service_1.tmdbService.getTrendingMovies();
    }
    async getTrendingTv() {
        return tmdb_service_1.tmdbService.getTrendingTv();
    }
    async search(query) {
        return tmdb_service_1.tmdbService.searchMulti(query);
    }
    async getDetails(id, type) {
        if (type === 'tv') {
            return tmdb_service_1.tmdbService.getTvDetails(id);
        }
        return tmdb_service_1.tmdbService.getMovieDetails(id);
    }
}
exports.MovieService = MovieService;
exports.movieService = new MovieService();
