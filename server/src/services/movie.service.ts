import { tmdbService } from './tmdb.service';

export class MovieService {
  async getTrending() {
    return tmdbService.getTrendingMovies();
  }

  async getTrendingTv() {
    return tmdbService.getTrendingTv();
  }

  async search(query: string) {
    return tmdbService.searchMulti(query);
  }

  async getDetails(id: string, type: 'movie' | 'tv') {
    if (type === 'tv') {
      return tmdbService.getTvDetails(id);
    }
    return tmdbService.getMovieDetails(id);
  }
}

export const movieService = new MovieService();
