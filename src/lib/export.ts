import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { exportRows } from "./database";

const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
export async function exportNutritionCSV(): Promise<void> {
  const { meals, water, weights } = await exportRows();
  const lines = [["Typ", "Datum", "Kategorie", "Name", "Menge", "Einheit", "Kalorien", "Protein", "Kohlenhydrate", "Fett"].map(cell).join(",")];
  for (const meal of meals) for (const entry of meal.entries) lines.push(["Mahlzeit", meal.date, meal.kind, entry.foodName, entry.amountGrams, "g", entry.nutrition.calories, entry.nutrition.protein, entry.nutrition.carbs, entry.nutrition.fat].map(cell).join(","));
  for (const item of water) lines.push(["Wasser", item.date, "", "Wasser", item.milliliters, "ml", "", "", "", ""].map(cell).join(","));
  for (const item of weights) lines.push(["Gewicht", item.date, "", "Gewicht", item.kilograms, "kg", "", "", "", ""].map(cell).join(","));
  const uri = `${FileSystem.cacheDirectory}calorieai-export-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(uri, `\uFEFF${lines.join("\n")}`, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Teilen ist auf diesem Gerät nicht verfügbar.");
  await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Ernährungstagebuch exportieren", UTI: "public.comma-separated-values-text" });
}

