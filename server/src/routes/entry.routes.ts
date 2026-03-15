import { Router } from 'express';
import { entryController } from '../controllers/entry.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', entryController.save.bind(entryController));
router.get('/', entryController.getAll.bind(entryController));
router.get('/stats', entryController.getStats.bind(entryController));

export default router;
