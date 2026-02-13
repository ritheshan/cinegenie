import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect movie routes so only authenticated users can access them
router.use(protect);

router.get('/trending', movieController.getTrending.bind(movieController));
router.get('/search', movieController.search.bind(movieController));
router.get('/:id', movieController.getDetails.bind(movieController));

export default router;
