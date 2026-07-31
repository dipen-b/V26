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

  int get daysRemaining => durationDays - daysCompleted;

  factory UserChallenge.fromJson(Map<String, dynamic> json) {
    return UserChallenge(
      id: json['id'] ?? '',
      challengeId: json['challenge_id'] ?? json['challengeId'] ?? '',
      title: json['title'] ?? '',
      durationDays: json['duration_days'] ?? json['durationDays'] ?? 0,
      progressPercentage: json['progress_percentage'] ?? json['progressPercentage'] ?? 0,
      status: json['status'] ?? 'active',
      startedAt: DateTime.parse(
        json['started_at'] ?? json['startedAt'] ?? DateTime.now().toString(),
      ),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'])
          : null,
    );
  }
}

class LeaderboardEntry {
  final int rank;
  final String userId;
  final String name;
  final int progress;

  LeaderboardEntry({
    required this.rank,
    required this.userId,
    required this.name,
    required this.progress,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'] ?? 0,
      userId: json['userId'] ?? json['user_id'] ?? '',
      name: json['name'] ?? '',
      progress: json['progress'] ?? 0,
    );
  }
}
