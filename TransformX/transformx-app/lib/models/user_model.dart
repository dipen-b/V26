class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final int age;
  final String gender;
  final double heightCm;
  final double currentWeightKg;
  final double goalWeightKg;
  final String transformationGoal;
  final String country;
  final String? profileImageUrl;
  final String? bio;
  final bool isPremium;
  final DateTime? premiumExpiresAt;
  final bool adConsent;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.age,
    required this.gender,
    required this.heightCm,
    required this.currentWeightKg,
    required this.goalWeightKg,
    required this.transformationGoal,
    required this.country,
    this.profileImageUrl,
    this.bio,
    required this.isPremium,
    this.premiumExpiresAt,
    required this.adConsent,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? json['first_name'] ?? '',
      lastName: json['lastName'] ?? json['last_name'] ?? '',
      age: json['age'] ?? 0,
      gender: json['gender'] ?? '',
      heightCm: (json['heightCm'] ?? json['height_cm'] ?? 0).toDouble(),
      currentWeightKg: (json['currentWeightKg'] ?? json['current_weight_kg'] ?? 0).toDouble(),
      goalWeightKg: (json['goalWeightKg'] ?? json['goal_weight_kg'] ?? 0).toDouble(),
      transformationGoal: json['transformationGoal'] ?? json['transformation_goal'] ?? '',
      country: json['country'] ?? '',
      profileImageUrl: json['profileImageUrl'] ?? json['profile_image_url'],
      bio: json['bio'],
      isPremium: json['isPremium'] ?? json['is_premium'] ?? false,
      premiumExpiresAt: json['premiumExpiresAt'] != null || json['premium_expires_at'] != null
          ? DateTime.parse(json['premiumExpiresAt'] ?? json['premium_expires_at'])
          : null,
      adConsent: json['adConsent'] ?? json['ad_consent'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'age': age,
      'gender': gender,
      'heightCm': heightCm,
      'currentWeightKg': currentWeightKg,
      'goalWeightKg': goalWeightKg,
      'transformationGoal': transformationGoal,
      'country': country,
      'profileImageUrl': profileImageUrl,
      'bio': bio,
      'isPremium': isPremium,
      'premiumExpiresAt': premiumExpiresAt?.toIso8601String(),
      'adConsent': adConsent,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    int? age,
    String? gender,
    double? heightCm,
    double? currentWeightKg,
    double? goalWeightKg,
    String? transformationGoal,
    String? country,
    String? profileImageUrl,
    String? bio,
    bool? isPremium,
    DateTime? premiumExpiresAt,
    bool? adConsent,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      age: age ?? this.age,
      gender: gender ?? this.gender,
      heightCm: heightCm ?? this.heightCm,
      currentWeightKg: currentWeightKg ?? this.currentWeightKg,
      goalWeightKg: goalWeightKg ?? this.goalWeightKg,
      transformationGoal: transformationGoal ?? this.transformationGoal,
      country: country ?? this.country,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      bio: bio ?? this.bio,
      isPremium: isPremium ?? this.isPremium,
      premiumExpiresAt: premiumExpiresAt ?? this.premiumExpiresAt,
      adConsent: adConsent ?? this.adConsent,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

class UserStats {
  final double currentWeight;
  final double goalWeight;
  final double weightLoss;
  final int activeChallenges;
  final int totalWorkouts;
  final int achievements;

  UserStats({
    required this.currentWeight,
    required this.goalWeight,
    required this.weightLoss,
    required this.activeChallenges,
    required this.totalWorkouts,
    required this.achievements,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      currentWeight: (json['currentWeight'] ?? json['current_weight'] ?? 0).toDouble(),
      goalWeight: (json['goalWeight'] ?? json['goal_weight'] ?? 0).toDouble(),
      weightLoss: (json['weightLoss'] ?? json['weight_loss'] ?? 0).toDouble(),
      activeChallenges: json['activeChallenges'] ?? json['active_challenges'] ?? 0,
      totalWorkouts: json['totalWorkouts'] ?? json['total_workouts'] ?? 0,
      achievements: json['achievements'] ?? 0,
    );
  }
}
