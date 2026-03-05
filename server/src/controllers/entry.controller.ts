import { Request, Response } from 'express';
import { entryService } from '../services/entry.service';
import { z } from 'zod';

const saveEntrySchema = z.object({
  mediaId: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1),
  posterPath: z.string().default(''),
  transcript: z.string().min(1),
  aiAnalysis: z.object({
    grammarScore: z.number().min(0).max(100),
    fluencyScore: z.number().min(0).max(100),
    vocabularyScore: z.number().min(0).max(100),
    confidenceScore: z.number().min(0).max(100),
    mistakes: z.array(z.string()),
    suggestions: z.array(z.string()),
    improvedVersion: z.string().default(''),
  }),
});

export class EntryController {
  async save(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = saveEntrySchema.parse(req.body);
      const entry = await entryService.saveEntry({ userId, ...data });
      res.status(201).json({ success: true, data: entry });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: (error as any).errors[0].message });
      }
      console.error('Save entry error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Failed to save entry' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const result = await entryService.getUserEntries(userId, page);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch entries' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const stats = await entryService.getDashboardStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Dashboard stats error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
  }
}

export const entryController = new EntryController();
