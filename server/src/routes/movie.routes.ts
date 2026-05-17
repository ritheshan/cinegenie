import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/trending', movieController.getTrending.bind(movieController));
router.get('/search', movieController.search.bind(movieController));
router.get('/:id', movieController.getDetails.bind(movieController));

export default router;
