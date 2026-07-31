import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { userService } from '../services/user.service';
import { AppError } from '../middleware/error-handler.middleware';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User not found');
    }

    const profile = await userService.getUserProfile(userId);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User not found');
    }

    const updated = await userService.updateProfile(userId, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Update user goals
router.put('/goals', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User not found');
    }

    const updated = await userService.updateGoals(userId, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Get user stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'User not found');
    }

    const stats = await userService.getStats(userId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Get public user profile
router.get('/:userId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const profile = await userService.getUserProfile(userId);

    // Don't expose sensitive data for public profiles
    const publicProfile = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImageUrl: profile.profileImageUrl,
      bio: profile.bio,
      country: profile.country,
      currentWeightKg: profile.currentWeightKg,
      goalWeightKg: profile.goalWeightKg,
      stats: profile.stats,
    };

    res.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
