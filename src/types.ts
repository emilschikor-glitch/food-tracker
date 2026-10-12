export type GoalKind = "lose" | "maintain" | "gain";
export type DietKind = "normal" | "vegetarian" | "vegan" | "pescetarian";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very";
export type Sex = "female" | "male" | "unspecified";
export type MealKind = "breakfast" | "lunch" | "dinner" | "snack";

export type Nutrition = { calories: number; protein: number; carbs: number; fat: number; fiber: number };
export const ZERO_NUTRITION: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

export type UserProfile = {
  id: number; name: string; birthDate: string | null; heightCm: number; weightKg: number;
  sex: Sex; activity: ActivityLevel; goal: GoalKind; diet: DietKind; allergies: string; preferences: string;
};
export type NutritionGoal = Nutrition;
export type MealEntry = { id: number; mealId: number; foodName: string; amountGrams: number; nutrition: Nutrition; source: string };
export type Meal = { id: number; date: string; kind: MealKind; title: string; entries: MealEntry[] };
export type WaterEntry = { id: number; date: string; milliliters: number };
export type WeightEntry = { id: number; date: string; kilograms: number };
export type FoodSearchResult = { name: string; brand?: string; barcode?: string; nutritionPer100g: Nutrition; source: string };
export type AIIngredient = { name: string; estimatedGrams: number; nutrition: Nutrition; confidence: number };
export type AIAnalysis = { summary: string; confidence: number; ingredients: AIIngredient[]; followUpQuestion?: string };

