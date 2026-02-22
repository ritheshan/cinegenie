import mongoose from 'mongoose';
import { JournalEntry, IJournalEntryDocument, IJournalEntry } from '../models/JournalEntry.model';

export class EntryRepository {
  async create(data: Omit<IJournalEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<IJournalEntryDocument> {
    const entry = new JournalEntry(data);
    return entry.save();
  }

  async findByUserId(userId: string, limit = 20, skip = 0): Promise<IJournalEntryDocument[]> {
    return JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async findById(id: string): Promise<IJournalEntryDocument | null> {
    return JournalEntry.findById(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return JournalEntry.countDocuments({ userId });
  }

  async countByUserIdAndType(userId: string, mediaType: 'movie' | 'tv'): Promise<number> {
    return JournalEntry.countDocuments({ userId, mediaType });
  }

  async getAverageScores(userId: string) {
    const result = await JournalEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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

  async getScoreHistory(userId: string, limit = 20) {
    return JournalEntry.find({ userId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select('title aiAnalysis.grammarScore aiAnalysis.fluencyScore aiAnalysis.vocabularyScore aiAnalysis.confidenceScore createdAt');
  }

  async getRecentEntries(userId: string, limit = 5): Promise<IJournalEntryDocument[]> {
    return JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title posterPath mediaType aiAnalysis.grammarScore aiAnalysis.fluencyScore aiAnalysis.vocabularyScore aiAnalysis.confidenceScore createdAt');
  }
}

export const entryRepository = new EntryRepository();
