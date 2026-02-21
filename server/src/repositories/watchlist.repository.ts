import { Watchlist, IWatchlistDocument, IWatchlist } from '../models/Watchlist.model';

export class WatchlistRepository {
  async add(data: Omit<IWatchlist, '_id' | 'createdAt'>): Promise<IWatchlistDocument> {
    const item = new Watchlist(data);
    return item.save();
  }

  async remove(id: string, userId: string): Promise<IWatchlistDocument | null> {
    return Watchlist.findOneAndDelete({ _id: id, userId });
  }

  async removeByMedia(userId: string, mediaId: number, mediaType: string): Promise<IWatchlistDocument | null> {
    return Watchlist.findOneAndDelete({ userId, mediaId, mediaType });
  }

  async findByUserId(userId: string, limit = 30, skip = 0): Promise<IWatchlistDocument[]> {
    return Watchlist.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async findByUserIdFiltered(userId: string, limit = 30, skip = 0, mediaType?: 'movie' | 'tv'): Promise<IWatchlistDocument[]> {
    const filter: any = { userId };
    if (mediaType) filter.mediaType = mediaType;
    return Watchlist.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async countFiltered(userId: string, mediaType?: 'movie' | 'tv'): Promise<number> {
    const filter: any = { userId };
    if (mediaType) filter.mediaType = mediaType;
    return Watchlist.countDocuments(filter);
  }

  async countByUserId(userId: string): Promise<number> {
    return Watchlist.countDocuments({ userId });
  }

  async countByType(userId: string, mediaType: 'movie' | 'tv'): Promise<number> {
    return Watchlist.countDocuments({ userId, mediaType });
  }

  async isWatchlist(userId: string, mediaId: number, mediaType: string): Promise<boolean> {
    const count = await Watchlist.countDocuments({ userId, mediaId, mediaType });
    return count > 0;
  }

  async findByMediaId(userId: string, mediaId: number, mediaType: string): Promise<IWatchlistDocument | null> {
    return Watchlist.findOne({ userId, mediaId, mediaType });
  }

  async checkBulk(userId: string, mediaIds: number[], mediaType: string): Promise<number[]> {
    const items = await Watchlist.find(
      { userId, mediaId: { $in: mediaIds }, mediaType },
      { mediaId: 1 }
    );
    return items.map((i) => i.mediaId);
  }

  async getRecent(userId: string, limit = 8): Promise<IWatchlistDocument[]> {
    return Watchlist.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }
}

export const watchlistRepository = new WatchlistRepository();
