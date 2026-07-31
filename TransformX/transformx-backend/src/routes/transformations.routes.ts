import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler.middleware';

const router = Router();

// Upload transformation photo
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');

    res.status(201).json({ success: true, data: null, message: 'TODO: Implement upload transformation' });
  } catch (error) {
    next(error);
  }
});

// Get user transformations
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');

    res.json({ success: true, data: { transformations: [] }, message: 'TODO: Implement get transformations' });
  } catch (error) {
    next(error);
  }
});

// Get transformation timeline
router.get('/timeline', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');

    res.json({ success: true, data: { timeline: [] }, message: 'TODO: Implement get timeline' });
  } catch (error) {
    next(error);
  }
});

export default router;
