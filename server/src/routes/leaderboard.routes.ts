import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/watched', leaderboardController.getWatchedLeaderboard.bind(leaderboardController));
router.get('/communication', leaderboardController.getCommunicationLeaderboard.bind(leaderboardController));

export default router;
