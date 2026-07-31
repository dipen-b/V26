import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, optional } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler.middleware';

const router = Router();

router.get('/global', optional, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: { leaderboard: [] }, message: 'TODO: Implement global leaderboard' });
  } catch (error) {
    next(error);
  }
});

router.get('/friends', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');
    res.json({ success: true, data: { leaderboard: [] }, message: 'TODO: Implement friends leaderboard' });
  } catch (error) {
    next(error);
  }
});

router.get('/challenge/:id', optional, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    res.json({ success: true, data: { leaderboard: [] }, message: `TODO: Implement challenge ${id} leaderboard` });
  } catch (error) {
    next(error);
  }
});

export default router;
