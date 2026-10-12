import * as SQLite from "expo-sqlite";
import { Meal, MealEntry, MealKind, Nutrition, NutritionGoal, UserProfile, WaterEntry, WeightEntry } from "../types";

let database: Promise<SQLite.SQLiteDatabase> | undefined;
const db = () => database ??= SQLite.openDatabaseAsync("calorie-ai.db");

export async function initializeDatabase(): Promise<void> {
  const connection = await db();
  await connection.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL, birth_date TEXT, height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL, sex TEXT NOT NULL, activity TEXT NOT NULL, goal TEXT NOT NULL,
      diet TEXT NOT NULL, allergies TEXT NOT NULL DEFAULT '', preferences TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS nutrition_goal (
      id INTEGER PRIMARY KEY CHECK (id = 1), calories REAL NOT NULL, protein REAL NOT NULL,
      carbs REAL NOT NULL, fat REAL NOT NULL, fiber REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS meals_date_idx ON meals(date);
    CREATE TABLE IF NOT EXISTS meal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
      food_name TEXT NOT NULL, amount_grams REAL NOT NULL, calories REAL NOT NULL, protein REAL NOT NULL,
      carbs REAL NOT NULL, fat REAL NOT NULL, fiber REAL NOT NULL, source TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS water_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, milliliters INTEGER NOT NULL CHECK (milliliters > 0)
    );
    CREATE TABLE IF NOT EXISTS weight_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, kilograms REAL NOT NULL CHECK (kilograms > 0)
    );
    CREATE TABLE IF NOT EXISTS favorite_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, calories100 REAL NOT NULL,
      protein100 REAL NOT NULL, carbs100 REAL NOT NULL, fat100 REAL NOT NULL, fiber100 REAL NOT NULL
    );
  `);
}

export async function loadProfile(): Promise<UserProfile | null> {
  const row = await (await db()).getFirstAsync<any>("SELECT * FROM profile WHERE id = 1");
  return row ? { id: 1, name: row.name, birthDate: row.birth_date, heightCm: row.height_cm, weightKg: row.weight_kg, sex: row.sex, activity: row.activity, goal: row.goal, diet: row.diet, allergies: row.allergies, preferences: row.preferences } : null;
}

export async function saveProfile(profile: Omit<UserProfile, "id">, goal: NutritionGoal): Promise<void> {
  const connection = await db();
  await connection.withTransactionAsync(async () => {
    await connection.runAsync(`INSERT OR REPLACE INTO profile (id,name,birth_date,height_cm,weight_kg,sex,activity,goal,diet,allergies,preferences) VALUES (1,?,?,?,?,?,?,?,?,?,?)`, profile.name, profile.birthDate, profile.heightCm, profile.weightKg, profile.sex, profile.activity, profile.goal, profile.diet, profile.allergies, profile.preferences);
    await connection.runAsync(`INSERT OR REPLACE INTO nutrition_goal (id,calories,protein,carbs,fat,fiber) VALUES (1,?,?,?,?,?)`, goal.calories, goal.protein, goal.carbs, goal.fat, goal.fiber);
  });
}

export async function loadGoal(): Promise<NutritionGoal | null> {
  const row = await (await db()).getFirstAsync<any>("SELECT calories, protein, carbs, fat, fiber FROM nutrition_goal WHERE id = 1");
  return row ? { calories: row.calories, protein: row.protein, carbs: row.carbs, fat: row.fat, fiber: row.fiber } : null;
}

export async function saveNutritionGoal(goal: NutritionGoal): Promise<void> {
  await (await db()).runAsync(`INSERT OR REPLACE INTO nutrition_goal (id,calories,protein,carbs,fat,fiber) VALUES (1,?,?,?,?,?)`, goal.calories, goal.protein, goal.carbs, goal.fat, goal.fiber);
}

export async function loadMeals(): Promise<Meal[]> {
  const connection = await db();
  const meals = await connection.getAllAsync<any>("SELECT * FROM meals ORDER BY date DESC, id DESC");
  const entries = await connection.getAllAsync<any>("SELECT * FROM meal_entries ORDER BY id");
  return meals.map(row => ({ id: row.id, date: row.date, kind: row.kind, title: row.title, entries: entries.filter(entry => entry.meal_id === row.id).map(mapEntry) }));
}

function mapEntry(row: any): MealEntry {
  return { id: row.id, mealId: row.meal_id, foodName: row.food_name, amountGrams: row.amount_grams, source: row.source, nutrition: { calories: row.calories, protein: row.protein, carbs: row.carbs, fat: row.fat, fiber: row.fiber } };
}

export async function addMeal(kind: MealKind, date: string, title: string, entries: Array<Omit<MealEntry, "id" | "mealId">>): Promise<number> {
  const connection = await db();
  let mealId = 0;
  await connection.withTransactionAsync(async () => {
    const result = await connection.runAsync("INSERT INTO meals (date, kind, title) VALUES (?, ?, ?)", date, kind, title);
    mealId = result.lastInsertRowId;
    for (const entry of entries) {
      const n = entry.nutrition;
      await connection.runAsync("INSERT INTO meal_entries (meal_id,food_name,amount_grams,calories,protein,carbs,fat,fiber,source) VALUES (?,?,?,?,?,?,?,?,?)", mealId, entry.foodName, entry.amountGrams, n.calories, n.protein, n.carbs, n.fat, n.fiber, entry.source);
    }
  });
  return mealId;
}

export async function deleteMeal(id: number): Promise<void> { await (await db()).runAsync("DELETE FROM meals WHERE id = ?", id); }
export async function addWater(date: string, milliliters: number): Promise<void> { await (await db()).runAsync("INSERT INTO water_entries (date, milliliters) VALUES (?, ?)", date, milliliters); }
export async function loadWater(): Promise<WaterEntry[]> { return (await (await db()).getAllAsync<any>("SELECT * FROM water_entries ORDER BY date DESC")).map(row => ({ id: row.id, date: row.date, milliliters: row.milliliters })); }
export async function addWeight(date: string, kilograms: number): Promise<void> { await (await db()).runAsync("INSERT INTO weight_entries (date, kilograms) VALUES (?, ?)", date, kilograms); }
export async function loadWeights(): Promise<WeightEntry[]> { return (await (await db()).getAllAsync<any>("SELECT * FROM weight_entries ORDER BY date")).map(row => ({ id: row.id, date: row.date, kilograms: row.kilograms })); }

export async function exportRows(): Promise<{ meals: Meal[]; water: WaterEntry[]; weights: WeightEntry[] }> {
  return { meals: await loadMeals(), water: await loadWater(), weights: await loadWeights() };
}

export async function deleteAllUserData(): Promise<void> {
  const connection = await db();
  await connection.withTransactionAsync(async () => {
    for (const table of ["meal_entries", "meals", "water_entries", "weight_entries", "favorite_foods", "nutrition_goal", "profile"]) await connection.runAsync(`DELETE FROM ${table}`);
  });
}

