import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', protect, authController.getMe.bind(authController));
router.put('/profile', protect, authController.updateProfile.bind(authController));

router.get('/google-url', authController.getGoogleAuthUrl.bind(authController));
router.post('/google/callback', authController.googleCallback.bind(authController));
router.get('/google/callback', authController.googleCallbackGet.bind(authController));

export default router;
