import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/database';
import { getRedis } from '../config/redis';
import { AppError } from '../middleware/error-handler.middleware';

export class ChallengeService {
  async getAllChallenges(limit = 10, offset = 0, category?: string) {
    let query = 'SELECT * FROM challenges WHERE is_active = true';
    const params: any[] = [];

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await executeQuery(query, params);
    const countRes = await executeQuery('SELECT COUNT(*) as count FROM challenges WHERE is_active = true');

    return {
      challenges: result.rows,
      total: parseInt(countRes.rows[0].count),
    };
  }

  async getChallengeById(id: string) {
    const result = await executeQuery(
      'SELECT * FROM challenges WHERE id = $1 AND is_active = true',
      [id],
    );
    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');
    return result.rows[0];
  }

  async getUserChallenges(userId: string) {
    const result = await executeQuery(
      `SELECT uc.*, c.title, c.duration_days, c.challenge_type
       FROM user_challenges uc
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.user_id = $1 AND uc.status = 'active'
       ORDER BY uc.started_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async joinChallenge(userId: string, challengeId: string) {
    const existing = await executeQuery(
      'SELECT id FROM user_challenges WHERE user_id = $1 AND challenge_id = $2 AND status != $3',
      [userId, challengeId, 'abandoned'],
    );

    if (existing.rows[0]) throw new AppError(409, 'Already joined this challenge');

    const id = uuidv4();
    const now = new Date();

    const result = await executeQuery(
      `INSERT INTO user_challenges (id, user_id, challenge_id, started_at, progress_percentage, is_active, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, userId, challengeId, now, 0, true, 'active', now, now],
    );

    return result.rows[0];
  }

  async updateProgress(userId: string, userChallengeId: string, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new AppError(400, 'Progress must be between 0 and 100');
    }

    const result = await executeQuery(
      `UPDATE user_challenges SET progress_percentage = $1, updated_at = $2
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [progress, new Date(), userChallengeId, userId],
    );

    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');
    return result.rows[0];
  }

  async completeChallenge(userId: string, userChallengeId: string) {
    const result = await executeQuery(
      `UPDATE user_challenges
       SET status = 'completed', completed_at = $1, progress_percentage = 100, updated_at = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [new Date(), userChallengeId, userId],
    );

    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');
    return result.rows[0];
  }

  async abandonChallenge(userId: string, userChallengeId: string) {
    const result = await executeQuery(
      `UPDATE user_challenges
       SET status = 'abandoned', is_active = false, updated_at = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [new Date(), userChallengeId, userId],
    );

    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');
    return result.rows[0];
  }

  async getLeaderboard(challengeId: string, limit = 100) {
    const redis = getRedis();
    const cacheKey = `leaderboard:${challengeId}`;
    const cached = await redis.get(cacheKey);

    if (cached) return JSON.parse(cached);

    const result = await executeQuery(
      `SELECT uc.*, u.first_name, u.last_name,
              ROW_NUMBER() OVER (ORDER BY uc.progress_percentage DESC) as rank
       FROM user_challenges uc
       JOIN users u ON uc.user_id = u.id
       WHERE uc.challenge_id = $1
       ORDER BY uc.progress_percentage DESC LIMIT $2`,
      [challengeId, limit],
    );

    const leaderboard = result.rows.map((r: any) => ({
      rank: parseInt(r.rank, 10),
      userId: r.user_id,
      name: `${r.first_name} ${r.last_name}`,
      progress: parseInt(r.progress_percentage, 10),
    }));

    await redis.setEx(cacheKey, 300, JSON.stringify(leaderboard));
    return leaderboard;
  }
}

export const challengeService = new ChallengeService();
