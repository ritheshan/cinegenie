import { Request, Response } from 'express';
import { watchlistService } from '../services/watchlist.service';
import { z } from 'zod';

const addWatchlistSchema = z.object({
  mediaId: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1),
  posterPath: z.string().default(''),
  backdropPath: z.string().default(''),
  rating: z.number().default(0),
  genres: z.array(z.string()).default([]),
  overview: z.string().default(''),
  releaseDate: z.string().default(''),
});

export class WatchlistController {
  async add(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = addWatchlistSchema.parse(req.body);
      const item = await watchlistService.addToWatchlist({ userId, ...data });
      res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: (error as any).errors[0].message });
      }
      if (error.message === 'Already in your watchlist') {
        return res.status(409).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message || 'Failed to add' });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params as { id: string };
      await watchlistService.removeFromWatchlist(userId, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message || 'Not found' });
    }
  }

  async removeByMedia(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const mediaId = parseInt(req.params.mediaId as string);
      const mediaType = req.params.mediaType as string;
      await watchlistService.removeByMediaId(userId, mediaId, mediaType);
      res.json({ success: true });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message || 'Not found' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const mediaType = req.query.type as 'movie' | 'tv' | undefined;
      const result = await watchlistService.getUserWatchlist(userId, page, 30, mediaType);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch watchlist' });
    }
  }

  async checkStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const mediaIdsStr = req.query.mediaIds as string;
      const mediaType = (req.query.mediaType as string) || 'movie';
      if (!mediaIdsStr) {
        return res.json({ success: true, data: [] });
      }
      const mediaIds = mediaIdsStr.split(',').map(Number).filter(Boolean);
      const watchlistIds = await watchlistService.checkWatchlistStatus(userId, mediaIds, mediaType);
      res.json({ success: true, data: watchlistIds });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to check status' });
    }
  }

  async getRecent(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const items = await watchlistService.getRecentWatchlist(userId);
      res.json({ success: true, data: items });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch recent' });
    }
  }

  async getCounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const counts = await watchlistService.getWatchlistCounts(userId);
      res.json({ success: true, data: counts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch counts' });
    }
  }
}

export const watchlistController = new WatchlistController();
