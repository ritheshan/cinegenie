import mongoose, { Schema, Document } from 'mongoose';

export interface IAiAnalysis {
  grammarScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  mistakes: string[];
  suggestions: string[];
  improvedVersion: string;
}

export interface IJournalEntry {
  _id?: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  transcript: string;
  aiAnalysis: IAiAnalysis;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJournalEntryDocument extends Omit<IJournalEntry, '_id'>, Document {}

const aiAnalysisSchema = new Schema(
  {
    grammarScore: { type: Number, required: true },
    fluencyScore: { type: Number, required: true },
    vocabularyScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    mistakes: [{ type: String }],
    suggestions: [{ type: String }],
    improvedVersion: { type: String, default: '' },
  },
  { _id: false }
);

const journalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    transcript: { type: String, required: true },
    aiAnalysis: { type: aiAnalysisSchema, required: true },
  },
  { timestamps: true }
);

// Compound index for efficient user queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });

export const JournalEntry = mongoose.model<IJournalEntryDocument>('JournalEntry', journalEntrySchema);
