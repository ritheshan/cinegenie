import { Request, Response } from 'express';
import { movieService } from '../services/movie.service';

export class MovieController {
  async getTrending(req: Request, res: Response) {
    try {
      const type = req.query.type as string;
      let data;
      if (type === 'tv') {
        data = await movieService.getTrendingTv();
      } else {
        data = await movieService.getTrending();
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch trending media' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, error: 'Search query is required' });
      }
      const results = await movieService.search(q as string);
      res.json({ success: true, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to search' });
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const type = (req.query.type as string) === 'tv' ? 'tv' : 'movie';
      const details = await movieService.getDetails(id as string, type);
      res.json({ success: true, data: details });
    } catch (error: any) {
      res.status(404).json({ success: false, error: 'Media not found' });
    }
  }
}

export const movieController = new MovieController();
