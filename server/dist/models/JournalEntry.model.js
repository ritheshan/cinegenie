"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const aiAnalysisSchema = new mongoose_1.Schema({
    grammarScore: { type: Number, required: true },
    fluencyScore: { type: Number, required: true },
    vocabularyScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    mistakes: [{ type: String }],
    suggestions: [{ type: String }],
    improvedVersion: { type: String, default: '' },
}, { _id: false });
const journalEntrySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    transcript: { type: String, required: true },
    aiAnalysis: { type: aiAnalysisSchema, required: true },
}, { timestamps: true });
// Compound index for efficient user queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });
exports.JournalEntry = mongoose_1.default.model('JournalEntry', journalEntrySchema);
