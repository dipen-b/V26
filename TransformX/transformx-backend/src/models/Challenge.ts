export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  challengeType: 'weight_loss_30' | 'transformation_90' | 'muscle_gain' | 'summer_body' | 'wedding';
  category: 'beginner' | 'intermediate' | 'advanced';
  rewardPoints: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  startedAt: Date;
  completedAt?: Date;
  progressPercentage: number;
  isActive: boolean;
  status: 'active' | 'completed' | 'abandoned';
}

export interface CreateChallengeDTO {
  title: string;
  description: string;
  durationDays: number;
  challengeType: 'weight_loss_30' | 'transformation_90' | 'muscle_gain' | 'summer_body' | 'wedding';
  category: 'beginner' | 'intermediate' | 'advanced';
  rewardPoints: number;
  imageUrl: string;
}

export interface JoinChallengeDTO {
  challengeId: string;
}

export interface UpdateChallengeProgressDTO {
  progressPercentage: number;
}
