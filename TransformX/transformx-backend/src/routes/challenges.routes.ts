import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, optional } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler.middleware';
import { challengeService } from '../services/challenge.service';

const router = Router();

const MAX_PAGE_SIZE = 100;
const MAX_LEADERBOARD_SIZE = 100;

// Query params arrive as strings (or arrays, when repeated). Fall back to the
// default instead of passing NaN straight into a SQL LIMIT/OFFSET, and cap the
// upper bound so a single request cannot ask for the whole table.
function parseBoundedInt(value: unknown, fallback: number, max: number) {
  if (typeof value !== 'string') return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

function requireUserId(req: AuthRequest) {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Not authenticated');
  return userId;
}

// List all challenges
router.get('/', optional, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, category } = req.query;
    const result = await challengeService.getAllChallenges(
      parseBoundedInt(limit, 10, MAX_PAGE_SIZE),
      parseBoundedInt(offset, 0, Number.MAX_SAFE_INTEGER),
      typeof category === 'string' ? category : undefined,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get user's active challenges
// Declared before '/:id' so the literal path is not shadowed by the param route.
router.get('/user/active', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challenges = await challengeService.getUserChallenges(requireUserId(req));
    res.json({ success: true, data: { challenges, total: challenges.length } });
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

// Join challenge — :id is a challenge id
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await challengeService.joinChallenge(requireUserId(req), req.params.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard — :id is a challenge id
router.get('/:id/leaderboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await challengeService.getLeaderboard(
      req.params.id,
      parseBoundedInt(req.query.limit, MAX_LEADERBOARD_SIZE, MAX_LEADERBOARD_SIZE),
    );
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

// The routes below act on a user_challenges row (the user's participation),
// not on the challenge itself — the param is named accordingly.

// Update challenge progress
router.put(
  '/participation/:userChallengeId/progress',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { progressPercentage } = req.body;
      const result = await challengeService.updateProgress(
        requireUserId(req),
        req.params.userChallengeId,
        progressPercentage,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
);

// Complete challenge
router.post(
  '/participation/:userChallengeId/complete',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await challengeService.completeChallenge(
        requireUserId(req),
        req.params.userChallengeId,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
);

// Abandon challenge
router.post(
  '/participation/:userChallengeId/abandon',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await challengeService.abandonChallenge(
        requireUserId(req),
        req.params.userChallengeId,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
