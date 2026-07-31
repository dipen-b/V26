import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/challenge_model.dart';
import '../../services/challenge_service.dart';

class ChallengeDetailScreen extends StatefulWidget {
  final String challengeId;
  final ChallengeService challengeService;

  const ChallengeDetailScreen(
    this.challengeId,
    this.challengeService, {
    Key? key,
  }) : super(key: key);

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
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Joined challenge!')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isJoining = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Challenge Details'),
        elevation: 0,
      ),
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

                // Details card
                Container(
                  decoration: AppDecoration.card,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetail(context, 'Duration', '${challenge.durationDays} days'),
                      const SizedBox(height: 12),
                      _buildDetail(context, 'Category', challenge.category),
                      const SizedBox(height: 12),
                      _buildDetail(
                        context,
                        'Challenge Type',
                        challenge.challengeType.replaceAll('_', ' '),
                      ),
                      const SizedBox(height: 12),
                      _buildDetail(context, 'Reward', '${challenge.rewardPoints} points'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Join button
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _isJoining ? null : _joinChallenge,
                    child: _isJoining
                        ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
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

  Widget _buildDetail(BuildContext context, String label, String value) {
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
