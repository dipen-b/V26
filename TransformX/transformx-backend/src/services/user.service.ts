import { executeQuery } from '../config/database';
import { AppError } from '../middleware/error-handler.middleware';
import { User, UpdateUserDTO, UpdateUserGoalsDTO } from '../models/User';

export class UserService {
  async getUserById(userId: string): Promise<User> {
    const result = await executeQuery(
      `SELECT
        id, email, first_name, last_name, age, gender, height_cm,
        current_weight_kg, goal_weight_kg, transformation_goal, country,
        profile_image_url, bio, is_premium, premium_expires_at, ad_consent,
        created_at, updated_at
      FROM users WHERE id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    return this.mapUserRow(result.rows[0]);
  }

  async getUserProfile(userId: string) {
    const user = await this.getUserById(userId);

    // Get latest weight
    const weightResult = await executeQuery(
      `SELECT weight_kg FROM daily_progress
       WHERE user_id = $1 AND weight_kg IS NOT NULL
       ORDER BY date DESC LIMIT 1`,
      [userId],
    );

    const currentWeight = weightResult.rows[0]?.weight_kg || user.currentWeightKg;

    // Get stats
    const statsResult = await executeQuery(
      `SELECT
        COUNT(DISTINCT challenge_id) as active_challenges,
        COUNT(DISTINCT DATE(created_at)) as total_days_logged
      FROM daily_progress WHERE user_id = $1`,
      [userId],
    );

    return {
      ...user,
      currentWeightKg: currentWeight,
      stats: statsResult.rows[0],
    };
  }

  async updateProfile(userId: string, data: UpdateUserDTO) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.firstName !== undefined) {
      fields.push(`first_name = $${paramCounter++}`);
      values.push(data.firstName);
    }

    if (data.lastName !== undefined) {
      fields.push(`last_name = $${paramCounter++}`);
      values.push(data.lastName);
    }

    if (data.currentWeightKg !== undefined) {
      fields.push(`current_weight_kg = $${paramCounter++}`);
      values.push(data.currentWeightKg);
    }

    if (data.goalWeightKg !== undefined) {
      fields.push(`goal_weight_kg = $${paramCounter++}`);
      values.push(data.goalWeightKg);
    }

    if (data.bio !== undefined) {
      fields.push(`bio = $${paramCounter++}`);
      values.push(data.bio);
    }

    if (data.profileImageUrl !== undefined) {
      fields.push(`profile_image_url = $${paramCounter++}`);
      values.push(data.profileImageUrl);
    }

    if (data.adConsent !== undefined) {
      fields.push(`ad_consent = $${paramCounter++}`);
      values.push(data.adConsent);
    }

    fields.push(`updated_at = $${paramCounter++}`);
    values.push(new Date());

    values.push(userId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`;
    const result = await executeQuery(query, values);

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    return this.mapUserRow(result.rows[0]);
  }

  async updateGoals(userId: string, data: UpdateUserGoalsDTO) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.currentWeightKg !== undefined) {
      fields.push(`current_weight_kg = $${paramCounter++}`);
      values.push(data.currentWeightKg);
    }

    if (data.goalWeightKg !== undefined) {
      fields.push(`goal_weight_kg = $${paramCounter++}`);
      values.push(data.goalWeightKg);
    }

    if (data.transformationGoal !== undefined) {
      fields.push(`transformation_goal = $${paramCounter++}`);
      values.push(data.transformationGoal);
    }

    fields.push(`updated_at = $${paramCounter++}`);
    values.push(new Date());

    values.push(userId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`;
    const result = await executeQuery(query, values);

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    return this.mapUserRow(result.rows[0]);
  }

  async getStats(userId: string) {
    const user = await this.getUserById(userId);

    // Get weight progress
    const weightResult = await executeQuery(
      `SELECT weight_kg FROM daily_progress
       WHERE user_id = $1 AND weight_kg IS NOT NULL
       ORDER BY date DESC LIMIT 1`,
      [userId],
    );

    const currentWeight = weightResult.rows[0]?.weight_kg || user.currentWeightKg;
    const weightLoss = user.currentWeightKg - currentWeight;

    // Get active challenges
    const challengesResult = await executeQuery(
      `SELECT COUNT(*) as count FROM user_challenges
       WHERE user_id = $1 AND status = 'active'`,
      [userId],
    );

    // Get total workouts
    const workoutsResult = await executeQuery(
      `SELECT COUNT(*) as count FROM daily_progress
       WHERE user_id = $1 AND workout_completed = true`,
      [userId],
    );

    // Get achievement count
    const achievementsResult = await executeQuery(
      `SELECT COUNT(*) as count FROM achievements WHERE user_id = $1`,
      [userId],
    );

    return {
      currentWeight,
      goalWeight: user.goalWeightKg,
      weightLoss,
      activeChallenges: parseInt(challengesResult.rows[0].count),
      totalWorkouts: parseInt(workoutsResult.rows[0].count),
      achievements: parseInt(achievementsResult.rows[0].count),
    };
  }

  private mapUserRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      age: row.age,
      gender: row.gender,
      heightCm: row.height_cm,
      currentWeightKg: row.current_weight_kg,
      goalWeightKg: row.goal_weight_kg,
      transformationGoal: row.transformation_goal,
      country: row.country,
      profileImageUrl: row.profile_image_url,
      bio: row.bio,
      isPremium: row.is_premium,
      premiumExpiresAt: row.premium_expires_at,
      adConsent: row.ad_consent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const userService = new UserService();
