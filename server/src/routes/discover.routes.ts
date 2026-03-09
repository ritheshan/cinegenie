import { Router } from 'express';
import { discoverController } from '../controllers/discover.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

const d = discoverController;

router.get('/trending',           d.trending.bind(d));
router.get('/movies/popular',     d.popularMovies.bind(d));
router.get('/movies/top-rated',   d.topRatedMovies.bind(d));
router.get('/movies/now-playing', d.nowPlaying.bind(d));
router.get('/tv/popular',         d.popularTv.bind(d));
router.get('/tv/top-rated',       d.topRatedTv.bind(d));
router.get('/genres',             d.genres.bind(d));
router.get('/genre/:id',          d.byGenre.bind(d));
router.get('/language/:code',     d.byLanguage.bind(d));
router.get('/advanced',           d.advancedFilter.bind(d));

// Actor routes
router.get('/actors/search',          d.searchActors.bind(d));
router.get('/actors/popular',          d.popularActors.bind(d));
router.get('/actors/filter',           d.actorsByFilter.bind(d));
router.get('/actors/:id',         d.actorDetails.bind(d));
router.get('/actors/:id/combined',d.actorCombined.bind(d));
router.get('/actors/:id/movies',  d.actorMovies.bind(d));
router.get('/actors/:id/tv',      d.actorTv.bind(d));

export default router;
