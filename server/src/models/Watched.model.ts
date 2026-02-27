import mongoose, { Schema, Document } from 'mongoose';

export interface IWatched {
  _id?: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  backdropPath: string;
  rating: number;
  genres: string[];
  overview: string;
  releaseDate: string;
  language?: string;
  actors?: string[];
  createdAt?: Date;
}

export interface IWatchedDocument extends Omit<IWatched, '_id'>, Document {}

const watchedSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    backdropPath: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    genres: [{ type: String }],
    overview: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
    language: { type: String, default: '' },
    actors: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent duplicate watched entries
watchedSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true });
watchedSchema.index({ userId: 1, createdAt: -1 });

export const Watched = mongoose.model<IWatchedDocument>('Watched', watchedSchema);
