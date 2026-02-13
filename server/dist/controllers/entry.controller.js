"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryController = exports.EntryController = void 0;
const entry_service_1 = require("../services/entry.service");
const zod_1 = require("zod");
const saveEntrySchema = zod_1.z.object({
    mediaId: zod_1.z.number(),
    mediaType: zod_1.z.enum(['movie', 'tv']),
    title: zod_1.z.string().min(1),
    posterPath: zod_1.z.string().default(''),
    transcript: zod_1.z.string().min(1),
    aiAnalysis: zod_1.z.object({
        grammarScore: zod_1.z.number().min(0).max(100),
        fluencyScore: zod_1.z.number().min(0).max(100),
        vocabularyScore: zod_1.z.number().min(0).max(100),
        confidenceScore: zod_1.z.number().min(0).max(100),
        mistakes: zod_1.z.array(zod_1.z.string()),
        suggestions: zod_1.z.array(zod_1.z.string()),
        improvedVersion: zod_1.z.string().default(''),
    }),
});
class EntryController {
    async save(req, res) {
        try {
            const userId = req.user.id;
            const data = saveEntrySchema.parse(req.body);
            const entry = await entry_service_1.entryService.saveEntry({ userId, ...data });
            res.status(201).json({ success: true, data: entry });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors[0].message });
            }
            console.error('Save entry error:', error.message);
            res.status(500).json({ success: false, error: error.message || 'Failed to save entry' });
        }
    }
    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const result = await entry_service_1.entryService.getUserEntries(userId, page);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch entries' });
        }
    }
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await entry_service_1.entryService.getDashboardStats(userId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Dashboard stats error:', error.message);
            res.status(500).json({ success: false, error: 'Failed to fetch stats' });
        }
    }
}
exports.EntryController = EntryController;
exports.entryController = new EntryController();
