"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchedService = exports.WatchedService = void 0;
const watched_repository_1 = require("../repositories/watched.repository");
class WatchedService {
    async addToWatched(input) {
        // Check if already watched
        const existing = await watched_repository_1.watchedRepository.findByMediaId(input.userId, input.mediaId, input.mediaType);
        if (existing) {
            throw new Error('Already in your watched list');
        }
        return watched_repository_1.watchedRepository.add(input);
    }
    async removeFromWatched(userId, watchedId) {
        const item = await watched_repository_1.watchedRepository.remove(watchedId, userId);
        if (!item) {
            throw new Error('Item not found or not owned by you');
        }
        return item;
    }
    async removeByMediaId(userId, mediaId, mediaType) {
        const item = await watched_repository_1.watchedRepository.removeByMedia(userId, mediaId, mediaType);
        if (!item) {
            throw new Error('Item not found or not owned by you');
        }
        return item;
    }
    async getUserWatched(userId, page = 1, limit = 30, mediaType) {
        const skip = (page - 1) * limit;
        const filter = mediaType ? { userId, mediaType } : { userId };
        const [items, total] = await Promise.all([
            watched_repository_1.watchedRepository.findByUserIdFiltered(userId, limit, skip, mediaType),
            watched_repository_1.watchedRepository.countFiltered(userId, mediaType),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limit) };
    }
    async checkWatchedStatus(userId, mediaIds, mediaType) {
        return watched_repository_1.watchedRepository.checkBulk(userId, mediaIds, mediaType);
    }
    async getWatchedCounts(userId) {
        const [total, movieCount, tvCount] = await Promise.all([
            watched_repository_1.watchedRepository.countByUserId(userId),
            watched_repository_1.watchedRepository.countByType(userId, 'movie'),
            watched_repository_1.watchedRepository.countByType(userId, 'tv'),
        ]);
        return { total, movieCount, tvCount };
    }
    async getRecentWatched(userId, limit = 8) {
        return watched_repository_1.watchedRepository.getRecent(userId, limit);
    }
}
exports.WatchedService = WatchedService;
exports.watchedService = new WatchedService();
