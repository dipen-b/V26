import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler.middleware';

const router = Router();

router.post('/friends/add', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');
    res.status(201).json({ success: true, data: null, message: 'TODO: Implement add friend' });
  } catch (error) {
    next(error);
  }
});

router.get('/friends', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');
    res.json({ success: true, data: { friends: [] }, message: 'TODO: Implement get friends' });
  } catch (error) {
    next(error);
  }
});

router.get('/achievements', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');
    res.json({ success: true, data: { achievements: [] }, message: 'TODO: Implement get achievements' });
  } catch (error) {
    next(error);
  }
});

export default router;
