import { watchedRepository } from '../repositories/watched.repository';
import { tmdbService } from './tmdb.service';

interface AddWatchedInput {
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

export class WatchedService {
  async addToWatched(input: AddWatchedInput) {
    // Check if already watched
    const existing = await watchedRepository.findByMediaId(input.userId, input.mediaId, input.mediaType);
    if (existing) {
      throw new Error('Already in your watched list');
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

    return watchedRepository.add(input);
  }

  async removeFromWatched(userId: string, watchedId: string) {
    const item = await watchedRepository.remove(watchedId, userId);
    if (!item) {
      throw new Error('Item not found or not owned by you');
    }
    return item;
  }

  async removeByMediaId(userId: string, mediaId: number, mediaType: string) {
    const item = await watchedRepository.removeByMedia(userId, mediaId, mediaType);
    if (!item) {
      throw new Error('Item not found or not owned by you');
    }
    return item;
  }

  async getUserWatched(userId: string, page = 1, limit = 30, mediaType?: 'movie' | 'tv') {
    const skip = (page - 1) * limit;
    const filter = mediaType ? { userId, mediaType } : { userId };
    const [items, total] = await Promise.all([
      watchedRepository.findByUserIdFiltered(userId, limit, skip, mediaType),
      watchedRepository.countFiltered(userId, mediaType),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async checkWatchedStatus(userId: string, mediaIds: number[], mediaType: string) {
    return watchedRepository.checkBulk(userId, mediaIds, mediaType);
  }

  async getWatchedCounts(userId: string) {
    const [total, movieCount, tvCount] = await Promise.all([
      watchedRepository.countByUserId(userId),
      watchedRepository.countByType(userId, 'movie'),
      watchedRepository.countByType(userId, 'tv'),
    ]);
    return { total, movieCount, tvCount };
  }

  async getRecentWatched(userId: string, limit = 8) {
    return watchedRepository.getRecent(userId, limit);
  }
}

export const watchedService = new WatchedService();
