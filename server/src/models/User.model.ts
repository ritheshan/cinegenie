import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../interfaces/auth.interface';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    avatar: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String },
    streak: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
