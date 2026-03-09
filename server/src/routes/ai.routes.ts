import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});
const router = Router();

router.use(protect);

router.post('/analyze', aiController.analyze.bind(aiController));
router.post('/transcribe', upload.single('audio'), aiController.transcribe.bind(aiController));

export default router;
