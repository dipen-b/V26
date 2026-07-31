export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  transformationGoal: 'weight_loss' | 'weight_gain' | 'muscle_building';
  country: string;
  profileImageUrl?: string;
  bio?: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  adConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  transformationGoal: 'weight_loss' | 'weight_gain' | 'muscle_building';
  country: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  currentWeightKg?: number;
  goalWeightKg?: number;
  bio?: string;
  profileImageUrl?: string;
  adConsent?: boolean;
}

export interface UpdateUserGoalsDTO {
  currentWeightKg?: number;
  goalWeightKg?: number;
  transformationGoal?: 'weight_loss' | 'weight_gain' | 'muscle_building';
}
