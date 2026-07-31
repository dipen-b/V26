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
        elevation: 0,
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
                      backgroundColor: AppColors.surfaceBg,
                      selectedColor: AppColors.secondary.withOpacity(0.15),
                      side: BorderSide(
                        color: isSelected ? AppColors.secondary : AppColors.border,
                      ),
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
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Error: ${snapshot.error}'),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            setState(() => _loadChallenges());
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                final challenges = snapshot.data ?? [];

                if (challenges.isEmpty) {
                  return Center(
                    child: Text(
                      'No challenges found',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  );
                }

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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
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
