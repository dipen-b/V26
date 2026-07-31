import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, optional } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler.middleware';
import { challengeService } from '../services/challenge.service';

const router = Router();

// List all challenges
router.get('/', optional, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, offset = 0, category } = req.query;
    const result = await challengeService.getAllChallenges(
      parseInt(limit as string),
      parseInt(offset as string),
      category as string,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get challenge details
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challenge = await challengeService.getChallengeById(req.params.id);
    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Join challenge
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const result = await challengeService.joinChallenge(userId, req.params.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get user's active challenges
router.get('/user/active', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const challenges = await challengeService.getUserChallenges(userId);
    res.json({ success: true, data: { challenges, total: challenges.length } });
  } catch (error) {
    next(error);
  }
});

// Update challenge progress
router.put('/:id/progress', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const { progressPercentage } = req.body;
    const result = await challengeService.updateProgress(userId, req.params.id, progressPercentage);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Complete challenge
router.post('/:id/complete', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const result = await challengeService.completeChallenge(userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/:id/leaderboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 100 } = req.query;
    const leaderboard = await challengeService.getLeaderboard(
      req.params.id,
      parseInt(limit as string),
    );
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

export default router;
