import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../widgets/progress_ring.dart';
import '../../widgets/stat_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              _buildHeader(),

              const SizedBox(height: 24),

              // Progress Ring Section
              _buildProgressSection(),

              const SizedBox(height: 32),

              // Quick Stats
              _buildQuickStats(),

              const SizedBox(height: 24),

              // Today's Trackers
              Text(
                'Today\'s Trackers',
                style: Theme.of(context).textTheme.headlineSmall,
              ),

              const SizedBox(height: 12),

              _buildTrackerCards(),

              const SizedBox(height: 24),

              // Today's Challenge
              _buildChallengeCard(context),

              const SizedBox(height: 24),

              // Action Buttons
              _buildActionButtons(context),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Show add progress modal
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good Morning',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Sarah Anderson',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ],
        ),
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [AppColors.primary, AppColors.secondary],
            ),
          ),
          child: const Center(
            child: Text('SA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressSection() {
    return Container(
      decoration: GlassmorphismDecoration.cardWithGradient,
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Weight Progress',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '75 kg',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.trending_down, size: 16, color: AppColors.accent),
                            const SizedBox(width: 4),
                            Text(
                              '5 kg lost',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.accent,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                '→ 70 kg',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const ProgressRing(
            progress: 0.625, // 5kg lost out of 8kg goal
            size: 140,
            label: 'Progress to Goal',
            value: '62.5',
            unit: '%',
            color: AppColors.accent,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    return Column(
      children: [
        Row(
          children: [
            CompactStatCard(
              label: 'Active Challenges',
              value: '3',
              unit: '',
              color: AppColors.primary,
            ),
            const SizedBox(width: 12),
            CompactStatCard(
              label: 'Workouts',
              value: '12',
              unit: 'this month',
              color: AppColors.secondary,
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            CompactStatCard(
              label: 'Current Streak',
              value: '7',
              unit: 'days',
              color: AppColors.warning,
            ),
            const SizedBox(width: 12),
            CompactStatCard(
              label: 'Achievements',
              value: '8',
              unit: 'badges',
              color: AppColors.accent,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTrackerCards() {
    return Column(
      children: [
        Row(
          children: [
            StatCard(
              title: 'Water Intake',
              value: '6',
              unit: '/ 8 glasses',
              icon: '💧',
              accentColor: AppColors.info,
            ),
            const SizedBox(width: 12),
            StatCard(
              title: 'Calories',
              value: '1,850',
              unit: '/ 2,000',
              icon: '🔥',
              accentColor: AppColors.warning,
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            StatCard(
              title: 'Steps',
              value: '8,342',
              unit: '/ 10k',
              icon: '👟',
              accentColor: AppColors.primary,
            ),
            const SizedBox(width: 12),
            StatCard(
              title: 'Protein',
              value: '95',
              unit: '/ 120g',
              icon: '🥚',
              accentColor: AppColors.accent,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildChallengeCard(BuildContext context) {
    return Container(
      decoration: GlassmorphismDecoration.cardWithGradient,
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
                      '30-Day Weight Loss',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '15 of 30 days completed',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '50%',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: 0.5,
              minHeight: 6,
              backgroundColor: AppColors.textSecondary.withOpacity(0.1),
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                context,
                icon: '📊',
                label: 'Analytics',
                onTap: () => context.go('/analytics'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildActionButton(
                context,
                icon: '🎯',
                label: 'Challenges',
                onTap: () => context.go('/challenges'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                context,
                icon: '🖼️',
                label: 'Transformation',
                onTap: () => context.go('/transformations'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildActionButton(
                context,
                icon: '👥',
                label: 'Community',
                onTap: () => context.go('/community'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(
    BuildContext context, {
    required String icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: GlassmorphismDecoration.card,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 32)),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.darkBg,
        border: Border(
          top: BorderSide(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildNavItem(context, icon: Icons.home_outlined, label: 'Home', index: 0),
              _buildNavItem(context, icon: Icons.bar_chart_outlined, label: 'Analytics', index: 1),
              SizedBox(width: 48), // Space for FAB
              _buildNavItem(context, icon: Icons.favorite_outline, label: 'Nutrition', index: 2),
              _buildNavItem(context, icon: Icons.person_outline, label: 'Profile', index: 3),
            ],
          ),
          SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required int index,
  }) {
    final isSelected = _selectedTab == index;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedTab = index);
        // Navigate to corresponding screen
      },
      child: Column(
        children: [
          Icon(
            icon,
            color: isSelected ? AppColors.primary : AppColors.textSecondary,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}
