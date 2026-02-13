"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryService = exports.EntryService = void 0;
const entry_repository_1 = require("../repositories/entry.repository");
const user_repository_1 = require("../repositories/user.repository");
class EntryService {
    async saveEntry(input) {
        const entry = await entry_repository_1.entryRepository.create(input);
        // Update user average score and streak
        try {
            const avgScores = await entry_repository_1.entryRepository.getAverageScores(input.userId);
            if (avgScores) {
                const user = await user_repository_1.userRepository.findById(input.userId);
                if (user) {
                    user.averageScore = Math.round((avgScores.avgGrammar + avgScores.avgFluency + avgScores.avgVocabulary + avgScores.avgConfidence) / 4);
                    user.streak = (user.streak || 0) + 1;
                    await user.save();
                }
            }
        }
        catch (err) {
            console.error('Failed to update user stats:', err);
        }
        return entry;
    }
    async getUserEntries(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            entry_repository_1.entryRepository.findByUserId(userId, limit, skip),
            entry_repository_1.entryRepository.countByUserId(userId),
        ]);
        return { entries, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getDashboardStats(userId) {
        const [total, movieCount, tvCount, avgScores, scoreHistory, recentEntries] = await Promise.all([
            entry_repository_1.entryRepository.countByUserId(userId),
            entry_repository_1.entryRepository.countByUserIdAndType(userId, 'movie'),
            entry_repository_1.entryRepository.countByUserIdAndType(userId, 'tv'),
            entry_repository_1.entryRepository.getAverageScores(userId),
            entry_repository_1.entryRepository.getScoreHistory(userId, 30),
            entry_repository_1.entryRepository.getRecentEntries(userId, 5),
        ]);
        return {
            totalEntries: total,
            movieCount,
            tvCount,
            averageScores: avgScores || { avgGrammar: 0, avgFluency: 0, avgVocabulary: 0, avgConfidence: 0 },
            scoreHistory: scoreHistory.map((e) => ({
                title: e.title,
                date: e.createdAt,
                grammar: e.aiAnalysis?.grammarScore || 0,
                fluency: e.aiAnalysis?.fluencyScore || 0,
                vocabulary: e.aiAnalysis?.vocabularyScore || 0,
                confidence: e.aiAnalysis?.confidenceScore || 0,
            })),
            recentEntries,
        };
    }
}
exports.EntryService = EntryService;
exports.entryService = new EntryService();
