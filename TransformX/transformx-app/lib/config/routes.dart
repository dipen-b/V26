import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/challenges/challenge_list_screen.dart';
import '../screens/challenges/challenge_detail_screen.dart';
import '../services/challenge_service.dart';
import 'package:dio/dio.dart';

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
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: 'signup',
          name: 'signup',
          builder: (context, state) => const SignupScreen(),
        ),
        GoRoute(
          path: 'onboarding',
          name: 'onboarding',
          builder: (context, state) => const OnboardingScreen(),
        ),
      ],
    ),

    // Main App Routes
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => const DashboardScreen(),
    ),

    GoRoute(
      path: '/challenges',
      name: 'challenges',
      builder: (context, state) {
        final dio = Dio();
        final challengeService = ChallengeService(dio);
        return ChallengeListScreen(challengeService);
      },
      routes: [
        GoRoute(
          path: ':id',
          name: 'challenge-detail',
          builder: (context, state) {
            final challengeId = state.pathParameters['id']!;
            final dio = Dio();
            final challengeService = ChallengeService(dio);
            return ChallengeDetailScreen(challengeId, challengeService);
          },
        ),
      ],
    ),

    GoRoute(
      path: '/transformations',
      name: 'transformations',
      builder: (context, state) => const Placeholder(),
    ),

    GoRoute(
      path: '/analytics',
      name: 'analytics',
      builder: (context, state) => const Placeholder(),
    ),

    GoRoute(
      path: '/community',
      name: 'community',
      builder: (context, state) => const Placeholder(),
    ),

    GoRoute(
      path: '/nutrition',
      name: 'nutrition',
      builder: (context, state) => const Placeholder(),
    ),

    GoRoute(
      path: '/profile',
      name: 'profile',
      builder: (context, state) => const Placeholder(),
    ),
  ],
);
