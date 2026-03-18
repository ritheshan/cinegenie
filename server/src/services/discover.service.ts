import { tmdbService } from './tmdb.service';

export class DiscoverService {
  async getTrending(page = 1) {
    return tmdbService.getTrendingAll(page);
  }

  async getPopularMovies(page = 1) {
    return tmdbService.getPopularMovies(page);
  }

  async getPopularTv(page = 1) {
    return tmdbService.getPopularTv(page);
  }

  async getTopRatedMovies(page = 1) {
    return tmdbService.getTopRatedMovies(page);
  }

  async getTopRatedTv(page = 1) {
    return tmdbService.getTopRatedTv(page);
  }

  async getNowPlaying(page = 1) {
    return tmdbService.getNowPlaying(page);
  }

  async getByGenre(genreId: number, type: 'movie' | 'tv', page = 1) {
    return tmdbService.getByGenre(genreId, type, page);
  }

  async getGenreList(type: 'movie' | 'tv') {
    return tmdbService.getGenreList(type);
  }

  async getByLanguage(langCode: string, type: 'movie' | 'tv', page = 1) {
    return tmdbService.getByLanguage(langCode, type, page);
  }

  async advancedDiscover(type: 'movie' | 'tv', filters: { genre?: number; language?: string; year?: number; sort_by?: string }, page = 1) {
    return tmdbService.advancedDiscover(type, filters, page);
  }

  // ── Actors ────────────────────────────────────────────────────────────────
  async searchActors(query: string) {
    return tmdbService.searchActors(query);
  }

  async getPopularActors(page = 1) {
    return tmdbService.getPopularActors(page);
  }

  async getPopularActorsPaginated(page = 1) {
    return tmdbService.getPopularActorsPaginated(page);
  }

  async getActorDetails(actorId: number) {
    return tmdbService.getActorDetails(actorId);
  }

  async getActorCombinedCredits(actorId: number) {
    return tmdbService.getActorCombinedCredits(actorId);
  }

  async getActorMovies(actorId: number, page = 1, genreId?: number, year?: number, sortBy?: string, language?: string) {
    return tmdbService.getActorMovies(actorId, page, genreId, year, sortBy, language);
  }

  async getActorTv(actorId: number, page = 1, genreId?: number, sortBy?: string, language?: string) {
    return tmdbService.getActorTv(actorId, page, genreId, sortBy, language);
  }

  async getActorsByFilter(language?: string, genre?: number, page = 1) {
    return tmdbService.getActorsByFilter(language, genre, page);
  }
}

export const discoverService = new DiscoverService();
