"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverService = exports.DiscoverService = void 0;
const tmdb_service_1 = require("./tmdb.service");
class DiscoverService {
    async getTrending(page = 1) {
        return tmdb_service_1.tmdbService.getTrendingAll(page);
    }
    async getPopularMovies(page = 1) {
        return tmdb_service_1.tmdbService.getPopularMovies(page);
    }
    async getPopularTv(page = 1) {
        return tmdb_service_1.tmdbService.getPopularTv(page);
    }
    async getTopRatedMovies(page = 1) {
        return tmdb_service_1.tmdbService.getTopRatedMovies(page);
    }
    async getTopRatedTv(page = 1) {
        return tmdb_service_1.tmdbService.getTopRatedTv(page);
    }
    async getNowPlaying(page = 1) {
        return tmdb_service_1.tmdbService.getNowPlaying(page);
    }
    async getByGenre(genreId, type, page = 1) {
        return tmdb_service_1.tmdbService.getByGenre(genreId, type, page);
    }
    async getGenreList(type) {
        return tmdb_service_1.tmdbService.getGenreList(type);
    }
    async getByLanguage(langCode, type, page = 1) {
        return tmdb_service_1.tmdbService.getByLanguage(langCode, type, page);
    }
    async advancedDiscover(type, filters, page = 1) {
        return tmdb_service_1.tmdbService.advancedDiscover(type, filters, page);
    }
    // ── Actors ────────────────────────────────────────────────────────────────
    async searchActors(query) {
        return tmdb_service_1.tmdbService.searchActors(query);
    }
    async getPopularActors(page = 1) {
        return tmdb_service_1.tmdbService.getPopularActors(page);
    }
    async getPopularActorsPaginated(page = 1) {
        return tmdb_service_1.tmdbService.getPopularActorsPaginated(page);
    }
    async getActorDetails(actorId) {
        return tmdb_service_1.tmdbService.getActorDetails(actorId);
    }
    async getActorCombinedCredits(actorId) {
        return tmdb_service_1.tmdbService.getActorCombinedCredits(actorId);
    }
    async getActorMovies(actorId, page = 1, genreId, year, sortBy, language) {
        return tmdb_service_1.tmdbService.getActorMovies(actorId, page, genreId, year, sortBy, language);
    }
    async getActorTv(actorId, page = 1, genreId, sortBy, language) {
        return tmdb_service_1.tmdbService.getActorTv(actorId, page, genreId, sortBy, language);
    }
    async getActorsByFilter(language, genre, page = 1) {
        return tmdb_service_1.tmdbService.getActorsByFilter(language, genre, page);
    }
}
exports.DiscoverService = DiscoverService;
exports.discoverService = new DiscoverService();
