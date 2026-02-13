"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const movie_routes_1 = __importDefault(require("./routes/movie.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const entry_routes_1 = __importDefault(require("./routes/entry.routes"));
const watched_routes_1 = __importDefault(require("./routes/watched.routes"));
const discover_routes_1 = __importDefault(require("./routes/discover.routes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limit each IP to 200 requests per windowMs
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api', limiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/movies', movie_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/entries', entry_routes_1.default);
app.use('/api/watched', watched_routes_1.default);
app.use('/api/discover', discover_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'AI Movie Journal API is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error', message: err.message });
});
exports.default = app;
