import { Request, Response } from 'express';
import { Watched } from '../models/Watched.model';
import { User } from '../models/User.model';

export class LeaderboardController {
  async getWatchedLeaderboard(req: Request, res: Response) {
    try {
      const type = (req.query.type as string) || 'movie'; // 'movie' or 'tv'
      
      const leaderboard = await Watched.aggregate([
        { $match: { mediaType: type } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: '$user.name',
            avatar: '$user.avatar',
            count: 1
          }
        }
      ]);

      res.json({ success: true, data: leaderboard });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch watched leaderboard' });
    }
  }

  async getCommunicationLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await User.find({ averageScore: { $gt: 0 } })
        .sort({ averageScore: -1 })
        .limit(20)
        .select('name avatar averageScore');
        
      res.json({ success: true, data: leaderboard });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch communication leaderboard' });
    }
  }
}

export const leaderboardController = new LeaderboardController();
