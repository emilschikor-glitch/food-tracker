import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TabName } from "../../App";
import { Card, PrimaryButton, ScreenTitle } from "../components/UI";
import { MacroBar } from "../components/MacroBar";
import { NutritionRing } from "../components/NutritionRing";
import { localDayKey, sumNutrition } from "../lib/nutrition";
import { useApp } from "../state/AppContext";
import { colors, palette, spacing } from "../theme";
import { MealKind } from "../types";

const labels: Record<MealKind, string> = { breakfast: "Frühstück", lunch: "Mittagessen", dinner: "Abendessen", snack: "Snacks" };
export function DashboardScreen({ goTo }: { goTo(tab: TabName): void }) {
  const { profile, goal, meals, water, addWater } = useApp(); const p = palette(useColorScheme()); const today = localDayKey();
  const todaysMeals = meals.filter(meal => localDayKey(new Date(meal.date)) === today); const consumed = useMemo(() => sumNutrition(todaysMeals.flatMap(meal => meal.entries.map(entry => entry.nutrition))), [todaysMeals]);
  const waterToday = water.filter(item => localDayKey(new Date(item.date)) === today).reduce((sum, item) => sum + item.milliliters, 0);
  if (!profile || !goal) return null;
  return <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <ScreenTitle title={`Hallo ${profile.name} 👋`} subtitle={new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())} />
    <Card style={styles.center}><NutritionRing consumed={consumed.calories} target={goal.calories} /><Text style={{ color: p.secondary }}>{Math.round(consumed.calories)} kcal gegessen · Ziel {Math.round(goal.calories)} kcal</Text></Card>
    <Card><MacroBar label="Protein" value={consumed.protein} target={goal.protein} color="#8A72E8" /><MacroBar label="Kohlenhydrate" value={consumed.carbs} target={goal.carbs} color="#F0A23C" /><MacroBar label="Fett" value={consumed.fat} target={goal.fat} color="#E86C78" /><MacroBar label="Ballaststoffe" value={consumed.fiber} target={goal.fiber} color={colors.green} /></Card>
    <Card><View style={styles.row}><View style={styles.row}><Ionicons name="water" size={24} color="#4BA8E8" /><View><Text style={{ color: p.text, fontSize: 16, fontWeight: "700" }}>Wasser</Text><Text style={{ color: p.secondary }}>{waterToday} / 2000 ml</Text></View></View><Pressable onPress={() => addWater(250)} style={styles.plus}><Ionicons name="add" size={23} color="white" /></Pressable></View><View style={[styles.waterTrack, { backgroundColor: p.border }]}><View style={[styles.waterFill, { width: `${Math.min(waterToday / 2000, 1) * 100}%` }]} /></View></Card>
    <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: p.text }]}>Heute</Text><Pressable onPress={() => goTo("nutrition")}><Text style={{ color: colors.green, fontWeight: "700" }}>Hinzufügen</Text></Pressable></View>
    {Object.entries(labels).map(([kind, label]) => { const matching = todaysMeals.filter(meal => meal.kind === kind); const total = sumNutrition(matching.map(meal => sumNutrition(meal.entries.map(e => e.nutrition)))); return <Pressable key={kind} onPress={() => goTo("nutrition")}><Card style={styles.meal}><View><Text style={{ color: p.text, fontWeight: "700", fontSize: 16 }}>{label}</Text><Text style={{ color: p.secondary, marginTop: 3 }}>{matching.length ? matching.map(m => m.title || m.entries[0]?.foodName).join(", ") : "Noch nichts eingetragen"}</Text></View><Text style={{ color: matching.length ? p.text : p.secondary, fontWeight: "700" }}>{Math.round(total.calories)} kcal</Text></Card></Pressable>; })}
    <PrimaryButton title="Essen scannen" onPress={() => goTo("scanner")} />
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { padding: spacing.lg, gap: spacing.md, paddingBottom: 30 }, center: { alignItems: "center" }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, plus: { backgroundColor: colors.green, width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" }, waterTrack: { height: 9, borderRadius: 99, overflow: "hidden" }, waterFill: { height: "100%", backgroundColor: "#4BA8E8" }, sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }, sectionTitle: { fontSize: 21, fontWeight: "800" }, meal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" } });
