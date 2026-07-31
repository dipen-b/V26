import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../widgets/challenge_card.dart';

class ChallengeCenterScreen extends StatefulWidget {
  const ChallengeCenterScreen({Key? key}) : super(key: key);

  @override
  State<ChallengeCenterScreen> createState() => _ChallengeCenterScreenState();
}

class _ChallengeCenterScreenState extends State<ChallengeCenterScreen> {
  String _selectedCategory = 'all';

  final List<Map<String, dynamic>> _challenges = [
    {
      'title': '30-Day Weight Loss',
      'description': 'Shed those extra pounds with daily workouts',
      'category': 'Weight Loss',
      'duration': 30,
      'participants': 2847,
      'emoji': '⬇️',
      'color': AppColors.accent,
    },
    {
      'title': '90-Day Transformation',
      'description': 'Complete body transformation in 3 months',
      'category': 'Transformation',
      'duration': 90,
      'participants': 1523,
      'emoji': '⚡',
      'color': AppColors.primary,
    },
    {
      'title': 'Muscle Gain Challenge',
      'description': 'Build lean muscle mass with strength training',
      'category': 'Muscle',
      'duration': 60,
      'participants': 1124,
      'emoji': '💪',
      'color': AppColors.warning,
    },
    {
      'title': 'Summer Body Challenge',
      'description': 'Get beach-ready in 45 days',
      'category': 'Beach Body',
      'duration': 45,
      'participants': 956,
      'emoji': '🏖️',
      'color': AppColors.secondary,
    },
    {
      'title': 'Wedding Transformation',
      'description': 'Look stunning for your big day',
      'category': 'Special',
      'duration': 120,
      'participants': 643,
      'emoji': '💒',
      'color': Colors.pink,
    },
    {
      'title': 'Core Strength Challenge',
      'description': 'Build a stronger, more stable core',
      'category': 'Fitness',
      'duration': 21,
      'participants': 782,
      'emoji': '🔥',
      'color': AppColors.warning,
    },
  ];

  final List<Map<String, dynamic>> _joinedChallenges = [
    {
      'title': '30-Day Weight Loss',
      'emoji': '⬇️',
      'daysCompleted': 15,
      'totalDays': 30,
    },
    {
      'title': '90-Day Transformation',
      'emoji': '⚡',
      'daysCompleted': 24,
      'totalDays': 90,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Challenges'),
        elevation: 0,
        backgroundColor: AppColors.darkBg,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Joined Challenges Section
            if (_joinedChallenges.isNotEmpty) ...[
              Text(
                'Your Active Challenges',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _joinedChallenges.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final challenge = _joinedChallenges[index];
                  return JoinedChallengeCard(
                    title: challenge['title'],
                    daysCompleted: challenge['daysCompleted'],
                    totalDays: challenge['totalDays'],
                    emoji: challenge['emoji'],
                    onTap: () {
                      // TODO: Navigate to challenge details
                    },
                  );
                },
              ),
              const SizedBox(height: 32),
            ],

            // All Challenges Section
            Text(
              'Available Challenges',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),

            // Category Filter
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildCategoryChip('all', 'All'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('weight_loss', 'Weight Loss'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('muscle', 'Muscle'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('fitness', 'Fitness'),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Challenges Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.95,
              ),
              itemCount: _challenges.length,
              itemBuilder: (context, index) {
                final challenge = _challenges[index];
                return ChallengeCard(
                  title: challenge['title'],
                  description: challenge['description'],
                  category: challenge['category'],
                  duration: challenge['duration'],
                  participants: challenge['participants'],
                  imageEmoji: challenge['emoji'],
                  accentColor: challenge['color'],
                  onTap: () {
                    context.push('/challenges/${index}');
                  },
                );
              },
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String value, String label) {
    final isSelected = _selectedCategory == value;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedCategory = value);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : AppColors.cardBg.withOpacity(0.6),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : Colors.white.withOpacity(0.2),
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: isSelected
                ? Colors.white
                : AppColors.textPrimary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
