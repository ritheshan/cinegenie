"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AiController = void 0;
const ai_service_1 = require("../services/ai.service");
const zod_1 = require("zod");
const analyzeSchema = zod_1.z.object({
    transcript: zod_1.z.string().min(1, 'Transcript cannot be empty'),
});
class AiController {
    async analyze(req, res) {
        try {
            const { transcript } = analyzeSchema.parse(req.body);
            const analysis = await ai_service_1.aiService.analyzeTranscript(transcript);
            res.json({ success: true, data: analysis });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors[0].message });
            }
            res.status(500).json({ success: false, error: error.message || 'AI Analysis Failed' });
        }
    }
    async transcribe(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No audio file provided' });
            }
            const { buffer, mimetype, originalname } = req.file;
            const transcriptText = await ai_service_1.aiService.transcribeAudio(buffer, mimetype, originalname || 'audio.webm');
            res.json({ success: true, data: { transcript: transcriptText } });
        }
        catch (error) {
            console.error('Transcribe controller error:', error.message);
            res.status(500).json({ success: false, error: error.message || 'Transcription Failed' });
        }
    }
}
exports.AiController = AiController;
exports.aiController = new AiController();
