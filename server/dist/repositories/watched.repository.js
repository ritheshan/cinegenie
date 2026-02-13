"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchedRepository = exports.WatchedRepository = void 0;
const Watched_model_1 = require("../models/Watched.model");
class WatchedRepository {
    async add(data) {
        const item = new Watched_model_1.Watched(data);
        return item.save();
    }
    async remove(id, userId) {
        return Watched_model_1.Watched.findOneAndDelete({ _id: id, userId });
    }
    async removeByMedia(userId, mediaId, mediaType) {
        return Watched_model_1.Watched.findOneAndDelete({ userId, mediaId, mediaType });
    }
    async findByUserId(userId, limit = 30, skip = 0) {
        return Watched_model_1.Watched.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }
    async findByUserIdFiltered(userId, limit = 30, skip = 0, mediaType) {
        const filter = { userId };
        if (mediaType)
            filter.mediaType = mediaType;
        return Watched_model_1.Watched.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }
    async countFiltered(userId, mediaType) {
        const filter = { userId };
        if (mediaType)
            filter.mediaType = mediaType;
        return Watched_model_1.Watched.countDocuments(filter);
    }
    async countByUserId(userId) {
        return Watched_model_1.Watched.countDocuments({ userId });
    }
    async countByType(userId, mediaType) {
        return Watched_model_1.Watched.countDocuments({ userId, mediaType });
    }
    async isWatched(userId, mediaId, mediaType) {
        const count = await Watched_model_1.Watched.countDocuments({ userId, mediaId, mediaType });
        return count > 0;
    }
    async findByMediaId(userId, mediaId, mediaType) {
        return Watched_model_1.Watched.findOne({ userId, mediaId, mediaType });
    }
    async checkBulk(userId, mediaIds, mediaType) {
        const items = await Watched_model_1.Watched.find({ userId, mediaId: { $in: mediaIds }, mediaType }, { mediaId: 1 });
        return items.map((i) => i.mediaId);
    }
    async getRecent(userId, limit = 8) {
        return Watched_model_1.Watched.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    }
}
exports.WatchedRepository = WatchedRepository;
exports.watchedRepository = new WatchedRepository();
