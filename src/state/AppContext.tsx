import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addMeal as dbAddMeal, addWater as dbAddWater, addWeight as dbAddWeight, deleteAllUserData, deleteMeal as dbDeleteMeal, initializeDatabase, loadGoal, loadMeals, loadProfile, loadWater, loadWeights, saveNutritionGoal, saveProfile } from "../lib/database";
import { Meal, MealEntry, MealKind, NutritionGoal, UserProfile, WaterEntry, WeightEntry } from "../types";

type AppState = {
  ready: boolean; profile: UserProfile | null; goal: NutritionGoal | null; meals: Meal[]; water: WaterEntry[]; weights: WeightEntry[];
  completeOnboarding(profile: Omit<UserProfile, "id">, goal: NutritionGoal): Promise<void>;
  addMeal(kind: MealKind, date: string, title: string, entries: Array<Omit<MealEntry, "id" | "mealId">>): Promise<void>;
  deleteMeal(id: number): Promise<void>; addWater(ml: number, date?: string): Promise<void>; addWeight(kg: number, date?: string): Promise<void>; eraseAll(): Promise<void>; reload(): Promise<void>;
  updateGoal(goal: NutritionGoal): Promise<void>;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false); const [profile, setProfile] = useState<UserProfile | null>(null); const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]); const [water, setWater] = useState<WaterEntry[]>([]); const [weights, setWeights] = useState<WeightEntry[]>([]);

  const reload = useCallback(async () => {
    const [nextProfile, nextGoal, nextMeals, nextWater, nextWeights] = await Promise.all([loadProfile(), loadGoal(), loadMeals(), loadWater(), loadWeights()]);
    setProfile(nextProfile); setGoal(nextGoal); setMeals(nextMeals); setWater(nextWater); setWeights(nextWeights);
  }, []);

  useEffect(() => { initializeDatabase().then(reload).finally(() => setReady(true)); }, [reload]);

  const value = useMemo<AppState>(() => ({ ready, profile, goal, meals, water, weights, reload,
    completeOnboarding: async (nextProfile, nextGoal) => { await saveProfile(nextProfile, nextGoal); await reload(); },
    addMeal: async (kind, date, title, entries) => { await dbAddMeal(kind, date, title, entries); await reload(); },
    deleteMeal: async id => { await dbDeleteMeal(id); await reload(); },
    addWater: async (ml, date = new Date().toISOString()) => { await dbAddWater(date, ml); await reload(); },
    addWeight: async (kg, date = new Date().toISOString()) => { await dbAddWeight(date, kg); await reload(); },
    updateGoal: async nextGoal => { await saveNutritionGoal(nextGoal); await reload(); },
    eraseAll: async () => { await deleteAllUserData(); await reload(); }
  }), [ready, profile, goal, meals, water, weights, reload]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp(): AppState {
  const context = useContext(Context); if (!context) throw new Error("useApp muss innerhalb von AppProvider verwendet werden"); return context;
}

