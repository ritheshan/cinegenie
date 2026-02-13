import { entryRepository } from '../repositories/entry.repository';
import { userRepository } from '../repositories/user.repository';
import { IJournalEntry } from '../models/JournalEntry.model';

interface SaveEntryInput {
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  transcript: string;
  aiAnalysis: {
    grammarScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    confidenceScore: number;
    mistakes: string[];
    suggestions: string[];
    improvedVersion: string;
  };
}

export class EntryService {
  async saveEntry(input: SaveEntryInput) {
    const entry = await entryRepository.create(input);

    // Update user average score and streak
    try {
      const avgScores = await entryRepository.getAverageScores(input.userId);
      if (avgScores) {
        const user = await userRepository.findById(input.userId);
        if (user) {
          user.averageScore = Math.round(
            (avgScores.avgGrammar + avgScores.avgFluency + avgScores.avgVocabulary + avgScores.avgConfidence) / 4
          );
          user.streak = (user.streak || 0) + 1;
          await user.save();
        }
      }
    } catch (err) {
      console.error('Failed to update user stats:', err);
    }

    return entry;
  }

  async getUserEntries(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      entryRepository.findByUserId(userId, limit, skip),
      entryRepository.countByUserId(userId),
    ]);
    return { entries, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getDashboardStats(userId: string) {
    const [total, movieCount, tvCount, avgScores, scoreHistory, recentEntries] = await Promise.all([
      entryRepository.countByUserId(userId),
      entryRepository.countByUserIdAndType(userId, 'movie'),
      entryRepository.countByUserIdAndType(userId, 'tv'),
      entryRepository.getAverageScores(userId),
      entryRepository.getScoreHistory(userId, 30),
      entryRepository.getRecentEntries(userId, 5),
    ]);

    return {
      totalEntries: total,
      movieCount,
      tvCount,
      averageScores: avgScores || { avgGrammar: 0, avgFluency: 0, avgVocabulary: 0, avgConfidence: 0 },
      scoreHistory: scoreHistory.map((e: any) => ({
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

export const entryService = new EntryService();
