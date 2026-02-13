import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', watchlistController.add.bind(watchlistController));
router.delete('/:id', watchlistController.remove.bind(watchlistController));
router.delete('/:mediaType/:mediaId', watchlistController.removeByMedia.bind(watchlistController));
router.get('/', watchlistController.getAll.bind(watchlistController));
router.get('/check', watchlistController.checkStatus.bind(watchlistController));
router.get('/recent', watchlistController.getRecent.bind(watchlistController));
router.get('/counts', watchlistController.getCounts.bind(watchlistController));

export default router;
