import { ActivityLevel, GoalKind, Nutrition, Sex, ZERO_NUTRITION } from "../types";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };

export function ageFromBirthDate(birthDate: string, now = new Date()): number {
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return Math.max(age, 0);
}

export function basalMetabolicRate(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return base + (sex === "male" ? 5 : sex === "female" ? -161 : -78);
}

export function calculateGoal(weightKg: number, heightCm: number, age: number, sex: Sex, activity: ActivityLevel, goal: GoalKind): Nutrition {
  const maintenance = basalMetabolicRate(weightKg, heightCm, age, sex) * ACTIVITY_FACTORS[activity];
  const adjustment = goal === "lose" ? -350 : goal === "gain" ? 250 : 0;
  const calories = Math.max(1200, Math.round(maintenance + adjustment));
  return { calories, protein: Math.round(weightKg * (goal === "gain" ? 1.8 : 1.5)), carbs: Math.round(calories * 0.45 / 4), fat: Math.round(calories * 0.3 / 9), fiber: 30 };
}

export function scaleNutrition(per100g: Nutrition, grams: number): Nutrition {
  const factor = Math.max(0, grams) / 100;
  return mapNutrition(per100g, value => value * factor);
}

export function sumNutrition(values: Nutrition[]): Nutrition {
  return values.reduce((total, item) => ({ calories: total.calories + item.calories, protein: total.protein + item.protein, carbs: total.carbs + item.carbs, fat: total.fat + item.fat, fiber: total.fiber + item.fiber }), { ...ZERO_NUTRITION });
}

export function mapNutrition(value: Nutrition, transform: (value: number) => number): Nutrition {
  return { calories: transform(value.calories), protein: transform(value.protein), carbs: transform(value.carbs), fat: transform(value.fat), fiber: transform(value.fiber) };
}

export function localDayKey(date = new Date()): string {
  const y = date.getFullYear(); const m = `${date.getMonth() + 1}`.padStart(2, "0"); const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
