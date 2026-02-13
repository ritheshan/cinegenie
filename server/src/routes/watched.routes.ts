import { Router } from 'express';
import { watchedController } from '../controllers/watched.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', watchedController.add.bind(watchedController));
router.delete('/:id', watchedController.remove.bind(watchedController));
router.delete('/:mediaType/:mediaId', watchedController.removeByMedia.bind(watchedController));
router.get('/', watchedController.getAll.bind(watchedController));
router.get('/check', watchedController.checkStatus.bind(watchedController));
router.get('/recent', watchedController.getRecent.bind(watchedController));
router.get('/counts', watchedController.getCounts.bind(watchedController));

export default router;
