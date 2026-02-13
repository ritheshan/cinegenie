"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchedController = exports.WatchedController = void 0;
const watched_service_1 = require("../services/watched.service");
const zod_1 = require("zod");
const addWatchedSchema = zod_1.z.object({
    mediaId: zod_1.z.number(),
    mediaType: zod_1.z.enum(['movie', 'tv']),
    title: zod_1.z.string().min(1),
    posterPath: zod_1.z.string().default(''),
    backdropPath: zod_1.z.string().default(''),
    rating: zod_1.z.number().default(0),
    genres: zod_1.z.array(zod_1.z.string()).default([]),
    overview: zod_1.z.string().default(''),
    releaseDate: zod_1.z.string().default(''),
});
class WatchedController {
    async add(req, res) {
        try {
            const userId = req.user.id;
            const data = addWatchedSchema.parse(req.body);
            const item = await watched_service_1.watchedService.addToWatched({ userId, ...data });
            res.status(201).json({ success: true, data: item });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors[0].message });
            }
            if (error.message === 'Already in your watched list') {
                return res.status(409).json({ success: false, error: error.message });
            }
            res.status(500).json({ success: false, error: error.message || 'Failed to add' });
        }
    }
    async remove(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await watched_service_1.watchedService.removeFromWatched(userId, id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message || 'Not found' });
        }
    }
    async removeByMedia(req, res) {
        try {
            const userId = req.user.id;
            const mediaId = parseInt(req.params.mediaId);
            const mediaType = req.params.mediaType;
            await watched_service_1.watchedService.removeByMediaId(userId, mediaId, mediaType);
            res.json({ success: true });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message || 'Not found' });
        }
    }
    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const mediaType = req.query.type;
            const result = await watched_service_1.watchedService.getUserWatched(userId, page, 30, mediaType);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch watched' });
        }
    }
    async checkStatus(req, res) {
        try {
            const userId = req.user.id;
            const mediaIdsStr = req.query.mediaIds;
            const mediaType = req.query.mediaType || 'movie';
            if (!mediaIdsStr) {
                return res.json({ success: true, data: [] });
            }
            const mediaIds = mediaIdsStr.split(',').map(Number).filter(Boolean);
            const watchedIds = await watched_service_1.watchedService.checkWatchedStatus(userId, mediaIds, mediaType);
            res.json({ success: true, data: watchedIds });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to check status' });
        }
    }
    async getRecent(req, res) {
        try {
            const userId = req.user.id;
            const items = await watched_service_1.watchedService.getRecentWatched(userId);
            res.json({ success: true, data: items });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch recent' });
        }
    }
    async getCounts(req, res) {
        try {
            const userId = req.user.id;
            const counts = await watched_service_1.watchedService.getWatchedCounts(userId);
            res.json({ success: true, data: counts });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch counts' });
        }
    }
}
exports.WatchedController = WatchedController;
exports.watchedController = new WatchedController();
