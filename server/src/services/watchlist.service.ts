import { watchlistRepository } from '../repositories/watchlist.repository';
import { tmdbService } from './tmdb.service';

interface AddWatchlistInput {
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  backdropPath: string;
  rating: number;
  genres: string[];
  overview: string;
  releaseDate: string;
  language?: string;
  actors?: string[];
}

export class WatchlistService {
  async addToWatchlist(input: AddWatchlistInput) {
    // Check if already in watchlist
    const existing = await watchlistRepository.findByMediaId(input.userId, input.mediaId, input.mediaType);
    if (existing) {
      throw new Error('Already in your watchlist');
    }

    try {
      // Fetch full details + credits to store language & actors
      const details = await tmdbService.getDetailsAndCredits(input.mediaId, input.mediaType);
      input.language = details.original_language || '';
      const cast = details.credits?.cast || [];
      input.actors = cast.slice(0, 10).map((c: any) => c.name);
      input.genres = (details.genres || []).map((g: any) => g.id.toString());
    } catch (err) {
      console.warn(`Failed to fetch TMDB details for ${input.mediaType} ${input.mediaId}`, err);
    }

    return watchlistRepository.add(input);
  }

  async removeFromWatchlist(userId: string, watchlistId: string) {
    const item = await watchlistRepository.remove(watchlistId, userId);
    if (!item) {
      throw new Error('Item not found or not owned by you');
    }
    return item;
  }

  async removeByMediaId(userId: string, mediaId: number, mediaType: string) {
    const item = await watchlistRepository.removeByMedia(userId, mediaId, mediaType);
    if (!item) {
      throw new Error('Item not found or not owned by you');
    }
    return item;
  }

  async getUserWatchlist(userId: string, page = 1, limit = 30, mediaType?: 'movie' | 'tv') {
    const skip = (page - 1) * limit;
    const filter = mediaType ? { userId, mediaType } : { userId };
    const [items, total] = await Promise.all([
      watchlistRepository.findByUserIdFiltered(userId, limit, skip, mediaType),
      watchlistRepository.countFiltered(userId, mediaType),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async checkWatchlistStatus(userId: string, mediaIds: number[], mediaType: string) {
    return watchlistRepository.checkBulk(userId, mediaIds, mediaType);
  }

  async getWatchlistCounts(userId: string) {
    const [total, movieCount, tvCount] = await Promise.all([
      watchlistRepository.countByUserId(userId),
      watchlistRepository.countByType(userId, 'movie'),
      watchlistRepository.countByType(userId, 'tv'),
    ]);
    return { total, movieCount, tvCount };
  }

  async getRecentWatchlist(userId: string, limit = 8) {
    return watchlistRepository.getRecent(userId, limit);
  }
}

export const watchlistService = new WatchlistService();
