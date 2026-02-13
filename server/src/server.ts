import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';
import { backfillLegacyMetadata } from './utils/backfill';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Run legacy data backfill in background
  backfillLegacyMetadata().catch(err => {
    console.error('Failed to run legacy metadata backfill:', err);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
