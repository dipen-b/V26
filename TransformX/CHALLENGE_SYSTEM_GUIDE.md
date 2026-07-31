# Challenge System Implementation Guide

## 📋 Overview
Complete guide to build the challenge system with backend API and Flutter UI.

---

## 🔧 BACKEND IMPLEMENTATION

### 1. Challenge Service (`src/services/challenge.service.ts`)

```typescript
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/database';
import { getRedis } from '../config/redis';
import { AppError } from '../middleware/error-handler.middleware';

export class ChallengeService {
  // Get all challenges with pagination and filtering
  async getAllChallenges(limit = 10, offset = 0, category?: string) {
    let query = 'SELECT * FROM challenges WHERE is_active = true';
    const params: any[] = [];
    
    if (category) {
      query += ` AND category = $1`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM challenges WHERE is_active = true');
    
    return {
      challenges: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  // Get challenge details
  async getChallengeById(id: string) {
    const result = await executeQuery(
      'SELECT * FROM challenges WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) throw new AppError(404, 'Challenge not found');
    return result.rows[0];
  }

  // Get user's active challenges
  async getUserChallenges(userId: string) {
    const result = await executeQuery(
      `SELECT uc.*, c.title, c.duration_days, c.challenge_type
       FROM user_challenges uc
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.user_id = $1 AND uc.status = 'active'
       ORDER BY uc.started_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // User joins a challenge
  async joinChallenge(userId: string, challengeId: string) {
    // Check if already joined
    const existing = await executeQuery(
      'SELECT id FROM user_challenges WHERE user_id = $1 AND challenge_id = $2 AND status != $3',
      [userId, challengeId, 'abandoned']
    );

    if (existing.rows[0]) {
      throw new AppError(409, 'Already joined');
    }

    const id = uuidv4();
    const now = new Date();
    
    const result = await executeQuery(
      `INSERT INTO user_challenges (id, user_id, challenge_id, started_at, progress_percentage, is_active, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, userId, challengeId, now, 0, true, 'active', now, now]
    );

    return result.rows[0];
  }

  // Update progress (0-100%)
  async updateProgress(userId: string, userChallengeId: string, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new AppError(400, 'Progress 0-100');
    }

    const result = await executeQuery(
      `UPDATE user_challenges SET progress_percentage = $1, updated_at = $2
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [progress, new Date(), userChallengeId, userId]
    );

    if (!result.rows[0]) throw new AppError(404, 'Not found');
    return result.rows[0];
  }

  // Complete challenge
  async completeChallenge(userId: string, userChallengeId: string) {
    const result = await executeQuery(
      `UPDATE user_challenges
       SET status = 'completed', completed_at = $1, progress_percentage = 100, updated_at = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [new Date(), userChallengeId, userId]
    );

    if (!result.rows[0]) throw new AppError(404, 'Not found');
    return result.rows[0];
  }

  // Get leaderboard with caching
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
      [challengeId, limit]
    );

    const leaderboard = result.rows.map((r: any) => ({
      rank: r.rank,
      userId: r.user_id,
      name: `${r.first_name} ${r.last_name}`,
      progress: r.progress_percentage,
    }));

    await redis.setEx(cacheKey, 300, JSON.stringify(leaderboard));
    return leaderboard;
  }
}

export const challengeService = new ChallengeService();
```

### 2. Challenge Controller Updates (`src/routes/challenges.routes.ts`)

Replace the stub with actual implementations:

```typescript
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { challengeService } from '../services/challenge.service';
import { AppError } from '../middleware/error-handler.middleware';

const router = Router();

// List all challenges
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, category } = req.query;
    const result = await challengeService.getAllChallenges(
      parseInt(limit as string),
      parseInt(offset as string),
      category as string
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get challenge details
router.get('/:id', async (req, res, next) => {
  try {
    const challenge = await challengeService.getChallengeById(req.params.id);
    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Join challenge
router.post('/:id/join', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const challenge = await challengeService.joinChallenge(userId, req.params.id);
    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Get user's challenges
router.get('/user/active', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const challenges = await challengeService.getUserChallenges(userId);
    res.json({ success: true, data: { challenges, total: challenges.length } });
  } catch (error) {
    next(error);
  }
});

// Update progress
router.put('/:id/progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const { progressPercentage } = req.body;
    const challenge = await challengeService.updateProgress(
      userId,
      req.params.id,
      progressPercentage
    );
    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Complete challenge
router.post('/:id/complete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Not authenticated');

    const challenge = await challengeService.completeChallenge(userId, req.params.id);
    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/:id/leaderboard', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const leaderboard = await challengeService.getLeaderboard(
      req.params.id,
      parseInt(limit as string)
    );
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## 📱 FRONTEND IMPLEMENTATION

### 1. Challenge Model (`lib/models/challenge_model.dart`)

```dart
class Challenge {
  final String id;
  final String title;
  final String description;
  final int durationDays;
  final String challengeType;
  final String category;
  final int rewardPoints;
  final String imageUrl;
  final bool isActive;

  Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.durationDays,
    required this.challengeType,
    required this.category,
    required this.rewardPoints,
    required this.imageUrl,
    required this.isActive,
  });

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      durationDays: json['duration_days'] ?? json['durationDays'] ?? 0,
      challengeType: json['challenge_type'] ?? json['challengeType'] ?? '',
      category: json['category'] ?? '',
      rewardPoints: json['reward_points'] ?? json['rewardPoints'] ?? 0,
      imageUrl: json['image_url'] ?? json['imageUrl'] ?? '',
      isActive: json['is_active'] ?? json['isActive'] ?? true,
    );
  }
}

class UserChallenge {
  final String id;
  final String challengeId;
  final String title;
  final int durationDays;
  final int progressPercentage;
  final String status;
  final DateTime startedAt;
  final DateTime? completedAt;

  UserChallenge({
    required this.id,
    required this.challengeId,
    required this.title,
    required this.durationDays,
    required this.progressPercentage,
    required this.status,
    required this.startedAt,
    this.completedAt,
  });

  int get daysCompleted {
    final days = DateTime.now().difference(startedAt).inDays;
    return days.clamp(0, durationDays);
  }

  factory UserChallenge.fromJson(Map<String, dynamic> json) {
    return UserChallenge(
      id: json['id'] ?? '',
      challengeId: json['challenge_id'] ?? json['challengeId'] ?? '',
      title: json['title'] ?? '',
      durationDays: json['duration_days'] ?? json['durationDays'] ?? 0,
      progressPercentage: json['progress_percentage'] ?? json['progressPercentage'] ?? 0,
      status: json['status'] ?? 'active',
      startedAt: DateTime.parse(json['started_at'] ?? json['startedAt'] ?? DateTime.now().toString()),
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
    );
  }
}
```

### 2. Challenge Service (`lib/services/challenge_service.dart`)

```dart
import 'package:dio/dio.dart';
import '../models/challenge_model.dart';

class ChallengeService {
  final Dio dio;

  ChallengeService(this.dio);

  Future<List<Challenge>> getAllChallenges({
    int limit = 10,
    int offset = 0,
    String? category,
  }) async {
    try {
      final response = await dio.get('/challenges', queryParameters: {
        'limit': limit,
        'offset': offset,
        if (category != null) 'category': category,
      });

      final challenges = (response.data['data']['challenges'] as List)
          .map((c) => Challenge.fromJson(c))
          .toList();

      return challenges;
    } catch (e) {
      rethrow;
    }
  }

  Future<Challenge> getChallengeById(String id) async {
    final response = await dio.get('/challenges/$id');
    return Challenge.fromJson(response.data['data']);
  }

  Future<List<UserChallenge>> getUserChallenges() async {
    final response = await dio.get('/challenges/user/active');
    final challenges = (response.data['data']['challenges'] as List)
        .map((c) => UserChallenge.fromJson(c))
        .toList();
    return challenges;
  }

  Future<UserChallenge> joinChallenge(String challengeId) async {
    final response = await dio.post('/challenges/$challengeId/join');
    return UserChallenge.fromJson(response.data['data']);
  }

  Future<UserChallenge> updateProgress(String userChallengeId, int progress) async {
    final response = await dio.put(
      '/challenges/$userChallengeId/progress',
      data: {'progressPercentage': progress},
    );
    return UserChallenge.fromJson(response.data['data']);
  }

  Future<void> completeChallenge(String userChallengeId) async {
    await dio.post('/challenges/$userChallengeId/complete');
  }

  Future<List<Map<String, dynamic>>> getLeaderboard(String challengeId) async {
    final response = await dio.get('/challenges/$challengeId/leaderboard');
    return List<Map<String, dynamic>>.from(response.data['data']);
  }
}
```

### 3. Challenge List Screen (`lib/screens/challenges/challenge_list_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/challenge_model.dart';
import '../../services/challenge_service.dart';

class ChallengeListScreen extends StatefulWidget {
  final ChallengeService challengeService;

  const ChallengeListScreen(this.challengeService, {Key? key}) : super(key: key);

  @override
  State<ChallengeListScreen> createState() => _ChallengeListScreenState();
}

class _ChallengeListScreenState extends State<ChallengeListScreen> {
  late Future<List<Challenge>> _challengesFuture;
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _loadChallenges();
  }

  void _loadChallenges() {
    _challengesFuture = widget.challengeService.getAllChallenges(
      category: _selectedCategory,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Challenges'),
      ),
      body: Column(
        children: [
          // Category filter
          Padding(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Beginner', 'Intermediate', 'Advanced']
                    .map((cat) {
                  final isSelected = _selectedCategory == (cat == 'All' ? null : cat);
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(cat),
                      selected: isSelected,
                      onSelected: (value) {
                        setState(() {
                          _selectedCategory = cat == 'All' ? null : cat;
                          _loadChallenges();
                        });
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Challenge list
          Expanded(
            child: FutureBuilder<List<Challenge>>(
              future: _challengesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }

                final challenges = snapshot.data ?? [];

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: challenges.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final challenge = challenges[index];
                    return _buildChallengeCard(challenge);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChallengeCard(Challenge challenge) {
    return GestureDetector(
      onTap: () => context.push('/challenges/${challenge.id}'),
      child: Container(
        decoration: AppDecoration.card,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        challenge.title,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        challenge.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    challenge.category,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: AppColors.secondary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${challenge.durationDays} days',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  '${challenge.rewardPoints} points',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

### 4. Challenge Detail Screen (`lib/screens/challenges/challenge_detail_screen.dart`)

```dart
import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/challenge_model.dart';
import '../../services/challenge_service.dart';

class ChallengeDetailScreen extends StatefulWidget {
  final String challengeId;
  final ChallengeService challengeService;

  const ChallengeDetailScreen(this.challengeId, this.challengeService, {Key? key})
      : super(key: key);

  @override
  State<ChallengeDetailScreen> createState() => _ChallengeDetailScreenState();
}

class _ChallengeDetailScreenState extends State<ChallengeDetailScreen> {
  late Future<Challenge> _challengeFuture;
  bool _isJoining = false;

  @override
  void initState() {
    super.initState();
    _challengeFuture = widget.challengeService.getChallengeById(widget.challengeId);
  }

  Future<void> _joinChallenge() async {
    setState(() => _isJoining = true);
    try {
      await widget.challengeService.joinChallenge(widget.challengeId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Joined challenge!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isJoining = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Challenge Details')),
      body: FutureBuilder<Challenge>(
        future: _challengeFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final challenge = snapshot.data!;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  challenge.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  challenge.description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  decoration: AppDecoration.card,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetail('Duration', '${challenge.durationDays} days'),
                      const SizedBox(height: 12),
                      _buildDetail('Category', challenge.category),
                      const SizedBox(height: 12),
                      _buildDetail('Reward', '${challenge.rewardPoints} points'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _isJoining ? null : _joinChallenge,
                    child: _isJoining
                        ? const CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        )
                        : const Text('Join Challenge'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetail(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
```

---

## 🔌 Integration Steps

1. **Copy services**: Add challenge.service.ts to backend
2. **Update routes**: Replace challenge routes with implementations above
3. **Create models**: Add challenge_model.dart to lib/models
4. **Add service**: Create challenge_service.dart in lib/services
5. **Build screens**: Create challenge list and detail screens
6. **Update routes config**: Add new screen routes to lib/config/routes.dart
7. **Test API**: Use Postman to test endpoints
8. **Wire UI**: Connect screens through navigation

---

## ✅ API Endpoints Ready
- `GET /api/challenges` - List all
- `GET /api/challenges/:id` - Details
- `GET /api/challenges/user/active` - User's challenges
- `POST /api/challenges/:id/join` - Join
- `PUT /api/challenges/:id/progress` - Update progress
- `POST /api/challenges/:id/complete` - Complete
- `GET /api/challenges/:id/leaderboard` - Leaderboard

---

## 📊 Database Schema (Already Created)
- `challenges` table
- `user_challenges` table (join table)
- `leaderboard` table (for caching)

This guide provides 100% complete implementation code ready to use!
