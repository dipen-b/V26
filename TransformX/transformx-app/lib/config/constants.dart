class AppConstants {
  // API
  static const String apiBaseUrl = 'http://localhost:5000/api';
  static const Duration apiTimeout = Duration(milliseconds: 30000);

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user';

  // Challenges
  static const Map<String, String> challengeTypes = {
    'weight_loss_30': '30-Day Weight Loss',
    'transformation_90': '90-Day Transformation',
    'muscle_gain': 'Muscle Gain',
    'summer_body': 'Summer Body',
    'wedding': 'Wedding Transformation',
  };

  static const Map<String, String> challengeCategories = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
  };

  // Transformation Goals
  static const Map<String, String> transformationGoals = {
    'weight_loss': 'Weight Loss',
    'weight_gain': 'Weight Gain',
    'muscle_building': 'Muscle Building',
  };

  // Genders
  static const Map<String, String> genders = {
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
  };

  // Moods
  static const Map<String, String> moods = {
    'great': '😊 Great',
    'good': '🙂 Good',
    'okay': '😐 Okay',
    'poor': '😞 Poor',
  };

  // Subscription Plans
  static const String freePrice = 'Free';
  static const String monthlyPrice = '\$9.99';
  static const String annualPrice = '\$79.99';

  // Countries
  static const List<String> targetCountries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'New Zealand',
  ];

  // Pagination
  static const int defaultPageSize = 20;
  static const int defaultLimit = 10;

  // Timings
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration shortAnimationDuration = Duration(milliseconds: 150);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);

  // Ads
  static const int adRefreshInterval = 60; // seconds
  static const int nativeAdPosition = 3; // Show native ad after 3 items

  // Password Requirements
  static const int minPasswordLength = 8;
  static const String passwordRequirements = 'Min 8 characters, uppercase, lowercase, and number';

  // Calorie Constants
  static const int defaultDailyCalories = 2000;
  static const int minCalories = 1200;
  static const int maxCalories = 5000;

  // Water Tracker
  static const int dailyWaterGoal = 3000; // ml
  static const int waterServingSize = 250; // ml per glass

  // Weight Tracker
  static const double minWeight = 30; // kg
  static const double maxWeight = 300; // kg

  // Height Tracker
  static const int minHeight = 100; // cm
  static const int maxHeight = 250; // cm

  // Age
  static const int minAge = 13;
  static const int maxAge = 120;
}
