import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { z } from 'zod';

const analyzeSchema = z.object({
  transcript: z.string().min(1, 'Transcript cannot be empty'),
});

export class AiController {
  async analyze(req: Request, res: Response) {
    try {
      const { transcript } = analyzeSchema.parse(req.body);
      const analysis = await aiService.analyzeTranscript(transcript);
      res.json({ success: true, data: analysis });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: (error as any).errors[0].message });
      }
      res.status(500).json({ success: false, error: error.message || 'AI Analysis Failed' });
    }
  }

  async transcribe(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No audio file provided' });
      }
      const { buffer, mimetype, originalname } = req.file;
      const transcriptText = await aiService.transcribeAudio(buffer, mimetype, originalname || 'audio.webm');
      res.json({ success: true, data: { transcript: transcriptText } });
    } catch (error: any) {
      console.error('Transcribe controller error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Transcription Failed' });
    }
  }
}

export const aiController = new AiController();
