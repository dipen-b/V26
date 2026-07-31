export interface DailyProgress {
  id: string;
  userId: string;
  date: Date;
  weightKg?: number;
  caloriesBurned?: number;
  caloriesConsumed?: number;
  waterMl?: number;
  steps?: number;
  proteinG?: number;
  mood?: 'great' | 'good' | 'okay' | 'poor';
  workoutCompleted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDailyProgressDTO {
  date: Date;
  weightKg?: number;
  caloriesBurned?: number;
  caloriesConsumed?: number;
  waterMl?: number;
  steps?: number;
  proteinG?: number;
  mood?: 'great' | 'good' | 'okay' | 'poor';
  workoutCompleted?: boolean;
  notes?: string;
}

export interface UpdateDailyProgressDTO {
  weightKg?: number;
  caloriesBurned?: number;
  caloriesConsumed?: number;
  waterMl?: number;
  steps?: number;
  proteinG?: number;
  mood?: 'great' | 'good' | 'okay' | 'poor';
  workoutCompleted?: boolean;
  notes?: string;
}

export interface DailyProgressSummary {
  date: Date;
  weightKg?: number;
  caloriesBurned?: number;
  caloriesConsumed?: number;
  waterMl?: number;
  steps?: number;
  proteinG?: number;
  mood?: string;
  workoutCompleted: boolean;
}

export interface WeeklySummary {
  week: string;
  averageWeight: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
  totalWaterMl: number;
  totalSteps: number;
  averageProteinG: number;
  workoutDays: number;
}

export interface MonthlySummary {
  month: string;
  startWeight: number;
  endWeight: number;
  weightLoss: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
  totalWaterMl: number;
  totalSteps: number;
  averageProteinG: number;
  workoutDays: number;
}
