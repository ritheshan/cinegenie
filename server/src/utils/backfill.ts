import { Watched } from '../models/Watched.model';
import { Watchlist } from '../models/Watchlist.model';
import { tmdbService } from '../services/tmdb.service';

export async function backfillLegacyMetadata() {
  try {
    // 1. Backfill Watched entries
    const emptyWatched = await Watched.find({ 
      $or: [
        { genres: { $size: 0 } }, 
        { language: { $in: [null, ''] } },
        { actors: { $size: 0 } }
      ] 
    });
    
    if (emptyWatched.length > 0) {
      console.log(`[Backfill] Found ${emptyWatched.length} legacy Watched documents to backfill.`);
      for (const doc of emptyWatched) {
        try {
          const details = await tmdbService.getDetailsAndCredits(doc.mediaId, doc.mediaType);
          doc.language = details.original_language || '';
          const cast = details.credits?.cast || [];
          doc.actors = cast.slice(0, 10).map((c: any) => c.name);
          doc.genres = (details.genres || []).map((g: any) => g.id.toString());
          await doc.save();
          console.log(`[Backfill] Successfully backfilled metadata for watched: "${doc.title}"`);
        } catch (e) {
          console.warn(`[Backfill] Failed to backfill watched "${doc.title}":`, e);
        }
      }
    }

    // 2. Backfill Watchlist entries
    const emptyWatchlist = await Watchlist.find({ 
      $or: [
        { genres: { $size: 0 } }, 
        { language: { $in: [null, ''] } },
        { actors: { $size: 0 } }
      ] 
    });

    if (emptyWatchlist.length > 0) {
      console.log(`[Backfill] Found ${emptyWatchlist.length} legacy Watchlist documents to backfill.`);
      for (const doc of emptyWatchlist) {
        try {
          const details = await tmdbService.getDetailsAndCredits(doc.mediaId, doc.mediaType);
          doc.language = details.original_language || '';
          const cast = details.credits?.cast || [];
          doc.actors = cast.slice(0, 10).map((c: any) => c.name);
          doc.genres = (details.genres || []).map((g: any) => g.id.toString());
          await doc.save();
          console.log(`[Backfill] Successfully backfilled metadata for watchlist: "${doc.title}"`);
        } catch (e) {
          console.warn(`[Backfill] Failed to backfill watchlist "${doc.title}":`, e);
        }
      }
    }
  } catch (err) {
    console.error('[Backfill] Error in metadata backfilling', err);
  }
}
