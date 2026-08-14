import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/database';
import { cacheDel, cacheGet, cacheSet } from '../config/redis';
import { AppError } from '../middleware/error-handler.middleware';

const LEADERBOARD_TTL_SECONDS = 300;

function leaderboardKey(challengeId: string) {
  return `leaderboard:${challengeId}`;
}

export class ChallengeService {
  private async invalidateLeaderboard(challengeId: string) {
    if (!challengeId) return;
    await cacheDel(leaderboardKey(challengeId));
  }

  async getAllChallenges(limit = 10, offset = 0, category?: string) {
    const filters = ['is_active = true'];
    const filterParams: any[] = [];

    if (category) {
      filters.push(`category = $${filterParams.length + 1}`);
      filterParams.push(category);
    }

    const where = `WHERE ${filters.join(' AND ')}`;

    const result = await executeQuery(
      `SELECT * FROM challenges ${where}
       ORDER BY created_at DESC LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`,
      [...filterParams, limit, offset],
    );

    // The count must use the same filters as the page query, otherwise
    // pagination totals are wrong whenever a category filter is applied.
    const countRes = await executeQuery(
      `SELECT COUNT(*) as count FROM challenges ${where}`,
      filterParams,
    );

    return {
      challenges: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
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
    // Fail with a 404 rather than a foreign-key violation when the challenge
    // does not exist or has been deactivated.
    await this.getChallengeById(challengeId);

    // user_challenges has UNIQUE(user_id, challenge_id), so a previously
    // abandoned attempt must be reset in place instead of inserted again.
    // Doing it as a single upsert also closes the check-then-insert race.
    const result = await executeQuery(
      `INSERT INTO user_challenges (id, user_id, challenge_id, started_at, progress_percentage, is_active, status)
       VALUES ($1, $2, $3, $4, 0, true, 'active')
       ON CONFLICT (user_id, challenge_id) DO UPDATE
         SET status = 'active',
             is_active = true,
             progress_percentage = 0,
             started_at = EXCLUDED.started_at,
             completed_at = NULL
         WHERE user_challenges.status = 'abandoned'
       RETURNING *`,
      [uuidv4(), userId, challengeId, new Date()],
    );

    // No row comes back when the conflict target exists but is not abandoned,
    // i.e. the user is already an active or completed participant.
    if (!result.rows[0]) throw new AppError(409, 'Already joined this challenge');

    await this.invalidateLeaderboard(challengeId);
    return result.rows[0];
  }

  async updateProgress(userId: string, userChallengeId: string, progress: number) {
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      throw new AppError(400, 'Progress must be an integer between 0 and 100');
    }

    const result = await executeQuery(
      `UPDATE user_challenges SET progress_percentage = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [progress, userChallengeId, userId],
    );

    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');

    await this.invalidateLeaderboard(result.rows[0].challenge_id);
    return result.rows[0];
  }

  async completeChallenge(userId: string, userChallengeId: string) {
    const result = await executeQuery(
      `UPDATE user_challenges
       SET status = 'completed', completed_at = $1, progress_percentage = 100
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [new Date(), userChallengeId, userId],
    );

    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');

    await this.invalidateLeaderboard(result.rows[0].challenge_id);
    return result.rows[0];
  }

  async abandonChallenge(userId: string, userChallengeId: string) {
    const result = await executeQuery(
      `UPDATE user_challenges
       SET status = 'abandoned', is_active = false
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [userChallengeId, userId],
    );

    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');

    await this.invalidateLeaderboard(result.rows[0].challenge_id);
    return result.rows[0];
  }

  async getLeaderboard(challengeId: string, limit = 100) {
    const cacheKey = leaderboardKey(challengeId);
    const cached = await cacheGet(cacheKey);

    if (cached) return JSON.parse(cached);

    const result = await executeQuery(
      `SELECT uc.user_id, uc.progress_percentage, u.first_name, u.last_name,
              ROW_NUMBER() OVER (ORDER BY uc.progress_percentage DESC, uc.started_at ASC) as rank
       FROM user_challenges uc
       JOIN users u ON uc.user_id = u.id
       WHERE uc.challenge_id = $1 AND uc.status <> 'abandoned'
       ORDER BY uc.progress_percentage DESC, uc.started_at ASC LIMIT $2`,
      [challengeId, limit],
    );

    const leaderboard = result.rows.map((r: any) => ({
      rank: parseInt(r.rank, 10),
      userId: r.user_id,
      name: `${r.first_name} ${r.last_name}`,
      progress: parseInt(r.progress_percentage, 10),
    }));

    await cacheSet(cacheKey, JSON.stringify(leaderboard), LEADERBOARD_TTL_SECONDS);
    return leaderboard;
  }
}

export const challengeService = new ChallengeService();
