import { describe, expect, it } from "vitest";
import { ageFromBirthDate, basalMetabolicRate, calculateGoal, localDayKey, scaleNutrition, sumNutrition } from "./nutrition";

describe("nutrition calculations", () => {
  it("uses the Mifflin-St Jeor formula", () => { expect(basalMetabolicRate(80, 180, 30, "male")).toBe(1780); expect(basalMetabolicRate(60, 165, 30, "female")).toBe(1320.25); });
  it("scales per-100g values to the consumed amount", () => { expect(scaleNutrition({ calories: 400, protein: 20, carbs: 60, fat: 10, fiber: 8 }, 25)).toEqual({ calories: 100, protein: 5, carbs: 15, fat: 2.5, fiber: 2 }); });
  it("never creates a goal below the protective floor", () => { expect(calculateGoal(40, 145, 80, "female", "sedentary", "lose").calories).toBe(1200); });
  it("sums every macro independently", () => { expect(sumNutrition([{ calories: 100, protein: 2, carbs: 3, fat: 4, fiber: 1 }, { calories: 50, protein: 1, carbs: 2, fat: 3, fiber: 2 }])).toEqual({ calories: 150, protein: 3, carbs: 5, fat: 7, fiber: 3 }); });
  it("calculates age around the birthday boundary", () => { expect(ageFromBirthDate("2000-10-13", new Date("2026-10-12T12:00:00"))).toBe(25); expect(ageFromBirthDate("2000-10-12", new Date("2026-10-12T12:00:00"))).toBe(26); });
  it("creates local calendar keys", () => { const date = new Date(2026, 0, 2, 23, 30); expect(localDayKey(date)).toBe("2026-01-02"); });
});

