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
          .map((c) => Challenge.fromJson(c as Map<String, dynamic>))
          .toList();

      return challenges;
    } catch (e) {
      rethrow;
    }
  }

  Future<Challenge> getChallengeById(String id) async {
    final response = await dio.get('/challenges/$id');
    return Challenge.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<List<UserChallenge>> getUserChallenges() async {
    final response = await dio.get('/challenges/user/active');
    final challenges = (response.data['data']['challenges'] as List)
        .map((c) => UserChallenge.fromJson(c as Map<String, dynamic>))
        .toList();
    return challenges;
  }

  Future<UserChallenge> joinChallenge(String challengeId) async {
    final response = await dio.post('/challenges/$challengeId/join');
    return UserChallenge.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<UserChallenge> updateProgress(
    String userChallengeId,
    int progress,
  ) async {
    final response = await dio.put(
      '/challenges/$userChallengeId/progress',
      data: {'progressPercentage': progress},
    );
    return UserChallenge.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<void> completeChallenge(String userChallengeId) async {
    await dio.post('/challenges/$userChallengeId/complete');
  }

  Future<List<LeaderboardEntry>> getLeaderboard(String challengeId) async {
    final response = await dio.get('/challenges/$challengeId/leaderboard');
    final leaderboard = (response.data['data'] as List)
        .map((e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>))
        .toList();
    return leaderboard;
  }
}
