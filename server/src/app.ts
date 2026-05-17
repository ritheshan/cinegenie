import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import aiRoutes from './routes/ai.routes';
import entryRoutes from './routes/entry.routes';
import watchedRoutes from './routes/watched.routes';
import discoverRoutes from './routes/discover.routes';
import watchlistRoutes from './routes/watchlist.routes';
import leaderboardRoutes from './routes/leaderboard.routes';

const app: Application = express();


// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/watched', watchedRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AI Movie Journal API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error', message: err.message });
});

export default app;
