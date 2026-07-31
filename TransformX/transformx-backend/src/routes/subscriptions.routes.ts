import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, optional } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler.middleware';

const router = Router();

router.get('/plans', optional, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: { plans: [] }, message: 'TODO: Implement get subscription plans' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-receipt', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');
    res.status(201).json({ success: true, data: null, message: 'TODO: Implement verify receipt' });
  } catch (error) {
    next(error);
  }
});

router.get('/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not found');
    res.json({ success: true, data: null, message: 'TODO: Implement get subscription status' });
  } catch (error) {
    next(error);
  }
});

export default router;
