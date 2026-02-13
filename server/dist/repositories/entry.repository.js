"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryRepository = exports.EntryRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const JournalEntry_model_1 = require("../models/JournalEntry.model");
class EntryRepository {
    async create(data) {
        const entry = new JournalEntry_model_1.JournalEntry(data);
        return entry.save();
    }
    async findByUserId(userId, limit = 20, skip = 0) {
        return JournalEntry_model_1.JournalEntry.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
    async findById(id) {
        return JournalEntry_model_1.JournalEntry.findById(id);
    }
    async countByUserId(userId) {
        return JournalEntry_model_1.JournalEntry.countDocuments({ userId });
    }
    async countByUserIdAndType(userId, mediaType) {
        return JournalEntry_model_1.JournalEntry.countDocuments({ userId, mediaType });
    }
    async getAverageScores(userId) {
        const result = await JournalEntry_model_1.JournalEntry.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    avgGrammar: { $avg: '$aiAnalysis.grammarScore' },
                    avgFluency: { $avg: '$aiAnalysis.fluencyScore' },
                    avgVocabulary: { $avg: '$aiAnalysis.vocabularyScore' },
                    avgConfidence: { $avg: '$aiAnalysis.confidenceScore' },
                },
            },
        ]);
        return result.length > 0 ? result[0] : null;
    }
    async getScoreHistory(userId, limit = 20) {
        return JournalEntry_model_1.JournalEntry.find({ userId })
            .sort({ createdAt: 1 })
            .limit(limit)
            .select('title aiAnalysis.grammarScore aiAnalysis.fluencyScore aiAnalysis.vocabularyScore aiAnalysis.confidenceScore createdAt');
    }
    async getRecentEntries(userId, limit = 5) {
        return JournalEntry_model_1.JournalEntry.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title posterPath mediaType aiAnalysis.grammarScore aiAnalysis.fluencyScore aiAnalysis.vocabularyScore aiAnalysis.confidenceScore createdAt');
    }
}
exports.EntryRepository = EntryRepository;
exports.entryRepository = new EntryRepository();
