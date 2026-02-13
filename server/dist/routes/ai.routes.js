"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.post('/analyze', ai_controller_1.aiController.analyze.bind(ai_controller_1.aiController));
router.post('/transcribe', upload.single('audio'), ai_controller_1.aiController.transcribe.bind(ai_controller_1.aiController));
exports.default = router;
