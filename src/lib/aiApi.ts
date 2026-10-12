import { AIAnalysis, NutritionGoal, UserProfile } from "../types";

function baseUrl(): string {
  const url = process.env.EXPO_PUBLIC_AI_BASE_URL?.replace(/\/$/, "");
  if (!url || url.includes("example.com")) throw new Error("KI-Backend ist noch nicht konfiguriert. Trage EXPO_PUBLIC_AI_BASE_URL in .env ein.");
  return url;
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) { const message = await response.text(); throw new Error(message || `Serverfehler (${response.status})`); }
  return response.json() as Promise<T>;
}

export async function analyzeFoodImage(uri: string): Promise<AIAnalysis> {
  const data = new FormData(); data.append("image", { uri, name: "meal.jpg", type: "image/jpeg" } as any);
  return parse<AIAnalysis>(await fetch(`${baseUrl()}/v1/food/analyze`, { method: "POST", body: data }));
}

export async function askNutritionAssistant(message: string, context: { profile: UserProfile; goal: NutritionGoal; consumedCalories: number }): Promise<string> {
  return (await parse<{ answer: string }>(await fetch(`${baseUrl()}/v1/assistant`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, context: { goal: context.goal, consumedCalories: context.consumedCalories, diet: context.profile.diet, allergies: context.profile.allergies, preferences: context.profile.preferences } }) }))).answer;
}

