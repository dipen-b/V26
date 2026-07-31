export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toISOString();
}

export function formatDecimal(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function formatKg(weight: number): string {
  return `${formatDecimal(weight, 1)}kg`;
}

export function formatHeight(heightCm: number): string {
  const feet = Math.floor(heightCm / 30.48);
  const inches = Math.round((heightCm % 30.48) / 2.54);
  return `${feet}'${inches}"`;
}

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return formatDecimal(weight / (heightM * heightM), 1);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateCalorieDeficit(
  tdee: number,
  goalCalories: number,
): number {
  return tdee - goalCalories;
}

export function calculateWeeklyProgressPercentage(
  startValue: number,
  currentValue: number,
  goalValue: number,
): number {
  if (startValue === goalValue) return 0;
  const progress = ((startValue - currentValue) / (startValue - goalValue)) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function formatProgressPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
