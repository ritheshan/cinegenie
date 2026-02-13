import { Watched, IWatchedDocument, IWatched } from '../models/Watched.model';

export class WatchedRepository {
  async add(data: Omit<IWatched, '_id' | 'createdAt'>): Promise<IWatchedDocument> {
    const item = new Watched(data);
    return item.save();
  }

  async remove(id: string, userId: string): Promise<IWatchedDocument | null> {
    return Watched.findOneAndDelete({ _id: id, userId });
  }

  async removeByMedia(userId: string, mediaId: number, mediaType: string): Promise<IWatchedDocument | null> {
    return Watched.findOneAndDelete({ userId, mediaId, mediaType });
  }

  async findByUserId(userId: string, limit = 30, skip = 0): Promise<IWatchedDocument[]> {
    return Watched.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async findByUserIdFiltered(userId: string, limit = 30, skip = 0, mediaType?: 'movie' | 'tv'): Promise<IWatchedDocument[]> {
    const filter: any = { userId };
    if (mediaType) filter.mediaType = mediaType;
    return Watched.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async countFiltered(userId: string, mediaType?: 'movie' | 'tv'): Promise<number> {
    const filter: any = { userId };
    if (mediaType) filter.mediaType = mediaType;
    return Watched.countDocuments(filter);
  }

  async countByUserId(userId: string): Promise<number> {
    return Watched.countDocuments({ userId });
  }

  async countByType(userId: string, mediaType: 'movie' | 'tv'): Promise<number> {
    return Watched.countDocuments({ userId, mediaType });
  }

  async isWatched(userId: string, mediaId: number, mediaType: string): Promise<boolean> {
    const count = await Watched.countDocuments({ userId, mediaId, mediaType });
    return count > 0;
  }

  async findByMediaId(userId: string, mediaId: number, mediaType: string): Promise<IWatchedDocument | null> {
    return Watched.findOne({ userId, mediaId, mediaType });
  }

  async checkBulk(userId: string, mediaIds: number[], mediaType: string): Promise<number[]> {
    const items = await Watched.find(
      { userId, mediaId: { $in: mediaIds }, mediaType },
      { mediaId: 1 }
    );
    return items.map((i) => i.mediaId);
  }

  async getRecent(userId: string, limit = 8): Promise<IWatchedDocument[]> {
    return Watched.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }
}

export const watchedRepository = new WatchedRepository();
