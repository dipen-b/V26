import 'package:go_router/go_router.dart';

final router = GoRouter(
  initialLocation: '/auth/login',
  routes: [
    // Auth Routes
    GoRoute(
      path: '/auth',
      routes: [
        GoRoute(
          path: 'login',
          name: 'login',
          builder: (context, state) {
            // TODO: Implement LoginScreen
            return const Placeholder();
          },
        ),
        GoRoute(
          path: 'signup',
          name: 'signup',
          builder: (context, state) {
            // TODO: Implement SignupScreen
            return const Placeholder();
          },
        ),
        GoRoute(
          path: 'onboarding',
          name: 'onboarding',
          builder: (context, state) {
            // TODO: Implement OnboardingScreen
            return const Placeholder();
          },
        ),
      ],
    ),

    // Main App Routes
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) {
        // TODO: Implement DashboardScreen
        return const Placeholder();
      },
    ),

    GoRoute(
      path: '/challenges',
      name: 'challenges',
      builder: (context, state) {
        // TODO: Implement ChallengeCenterScreen
        return const Placeholder();
      },
      routes: [
        GoRoute(
          path: ':id',
          name: 'challenge-detail',
          builder: (context, state) {
            // TODO: Implement ChallengeDetailScreen
            return const Placeholder();
          },
        ),
      ],
    ),

    GoRoute(
      path: '/transformations',
      name: 'transformations',
      builder: (context, state) {
        // TODO: Implement TransformationScreen
        return const Placeholder();
      },
      routes: [
        GoRoute(
          path: 'upload',
          name: 'upload-photo',
          builder: (context, state) {
            // TODO: Implement PhotoUploadScreen
            return const Placeholder();
          },
        ),
      ],
    ),

    GoRoute(
      path: '/analytics',
      name: 'analytics',
      builder: (context, state) {
        // TODO: Implement AnalyticsScreen
        return const Placeholder();
      },
    ),

    GoRoute(
      path: '/community',
      name: 'community',
      builder: (context, state) {
        // TODO: Implement CommunityScreen
        return const Placeholder();
      },
      routes: [
        GoRoute(
          path: 'leaderboard',
          name: 'leaderboard',
          builder: (context, state) {
            // TODO: Implement LeaderboardScreen
            return const Placeholder();
          },
        ),
        GoRoute(
          path: 'friends',
          name: 'friends',
          builder: (context, state) {
            // TODO: Implement FriendsScreen
            return const Placeholder();
          },
        ),
      ],
    ),

    GoRoute(
      path: '/nutrition',
      name: 'nutrition',
      builder: (context, state) {
        // TODO: Implement NutritionScreen
        return const Placeholder();
      },
    ),

    GoRoute(
      path: '/profile',
      name: 'profile',
      builder: (context, state) {
        // TODO: Implement ProfileScreen
        return const Placeholder();
      },
      routes: [
        GoRoute(
          path: 'subscription',
          name: 'subscription',
          builder: (context, state) {
            // TODO: Implement SubscriptionScreen
            return const Placeholder();
          },
        ),
      ],
    ),
  ],
);
