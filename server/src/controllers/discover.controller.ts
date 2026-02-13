import { Request, Response } from 'express';
import { discoverService } from '../services/discover.service';

export class DiscoverController {
  private page(req: Request): number {
    return Math.max(1, parseInt(req.query.page as string) || 1);
  }

  async trending(req: Request, res: Response) {
    try {
      const data = await discoverService.getTrending(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch trending' });
    }
  }

  async popularMovies(req: Request, res: Response) {
    try {
      const data = await discoverService.getPopularMovies(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch popular movies' });
    }
  }

  async popularTv(req: Request, res: Response) {
    try {
      const data = await discoverService.getPopularTv(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch popular TV' });
    }
  }

  async topRatedMovies(req: Request, res: Response) {
    try {
      const data = await discoverService.getTopRatedMovies(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch top rated movies' });
    }
  }

  async topRatedTv(req: Request, res: Response) {
    try {
      const data = await discoverService.getTopRatedTv(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch top rated TV' });
    }
  }

  async nowPlaying(req: Request, res: Response) {
    try {
      const data = await discoverService.getNowPlaying(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch now playing' });
    }
  }

  async genres(req: Request, res: Response) {
    try {
      const type = (req.query.type as string) === 'tv' ? 'tv' : 'movie';
      const data = await discoverService.getGenreList(type);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch genres' });
    }
  }

  async byGenre(req: Request, res: Response) {
    try {
      const genreId = parseInt(req.params.id as string);
      const type = (req.query.type as string) === 'tv' ? 'tv' : 'movie';
      if (isNaN(genreId)) {
        return res.status(400).json({ success: false, error: 'Invalid genre id' });
      }
      const data = await discoverService.getByGenre(genreId, type, this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch by genre' });
    }
  }

  async byLanguage(req: Request, res: Response) {
    try {
      const type = (req.query.type as 'movie' | 'tv') || 'movie';
      const { code } = req.params as { code: string };
      const data = await discoverService.getByLanguage(code, type, this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch by language' });
    }
  }

  async advancedFilter(req: Request, res: Response) {
    try {
      const type = (req.query.type as 'movie' | 'tv') || 'movie';
      const filters = {
        genre: req.query.genre ? parseInt(req.query.genre as string) : undefined,
        language: req.query.language as string | undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        sort_by: req.query.sort_by as string | undefined,
      };
      const data = await discoverService.advancedDiscover(type, filters, this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch advanced filter' });
    }
  }

  // ── Actor handlers ────────────────────────────────────────────────────────
  async searchActors(req: Request, res: Response) {
    try {
      const q = req.query.q as string;
      if (!q?.trim()) return res.status(400).json({ success: false, error: 'Query required' });
      const data = await discoverService.searchActors(q.trim());
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Actor search failed' });
    }
  }

  async popularActors(req: Request, res: Response) {
    try {
      const data = await discoverService.getPopularActors(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch popular actors' });
    }
  }

  async popularActorsPaginated(req: Request, res: Response) {
    try {
      const data = await discoverService.getPopularActorsPaginated(this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch popular actors' });
    }
  }

  async actorDetails(req: Request, res: Response) {
    try {
      const actorId = parseInt(req.params.id as string);
      const data = await discoverService.getActorDetails(actorId);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Actor not found' });
    }
  }

  async actorCombined(req: Request, res: Response) {
    try {
      const actorId = parseInt(req.params.id as string);
      const data = await discoverService.getActorCombinedCredits(actorId);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch actor credits' });
    }
  }

  async actorMovies(req: Request, res: Response) {
    try {
      const actorId  = parseInt(req.params.id as string);
      const genreId  = req.query.genre    ? parseInt(req.query.genre as string)   : undefined;
      const year     = req.query.year     ? parseInt(req.query.year as string)    : undefined;
      const sortBy   = (req.query.sort_by  as string) || 'popularity.desc';
      const language = (req.query.language as string) || undefined;
      const data = await discoverService.getActorMovies(actorId, this.page(req), genreId, year, sortBy, language);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch actor movies' });
    }
  }

  async actorTv(req: Request, res: Response) {
    try {
      const actorId  = parseInt(req.params.id as string);
      const genreId  = req.query.genre    ? parseInt(req.query.genre as string)  : undefined;
      const sortBy   = (req.query.sort_by  as string) || 'popularity.desc';
      const language = (req.query.language as string) || undefined;
      const data = await discoverService.getActorTv(actorId, this.page(req), genreId, sortBy, language);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch actor TV' });
    }
  }

  async actorsByFilter(req: Request, res: Response) {
    try {
      const language = req.query.language as string | undefined;
      const genre = req.query.genre ? parseInt(req.query.genre as string) : undefined;
      
      const data = await discoverService.getActorsByFilter(language, genre, this.page(req));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch filtered actors' });
    }
  }
}

export const discoverController = new DiscoverController();
