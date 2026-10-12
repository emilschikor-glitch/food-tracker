import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddFoodModal } from "../components/AddFoodModal";
import { Card, ScreenTitle } from "../components/UI";
import { localDayKey, sumNutrition } from "../lib/nutrition";
import { useApp } from "../state/AppContext";
import { colors, palette, spacing } from "../theme";
import { MealKind } from "../types";

const titles: Record<MealKind, string> = { breakfast: "Frühstück", lunch: "Mittagessen", dinner: "Abendessen", snack: "Snacks" };
export function NutritionScreen() {
  const { meals, deleteMeal } = useApp(); const p = palette(useColorScheme()); const [adding, setAdding] = useState(false); const today = localDayKey(); const todaysMeals = meals.filter(m => localDayKey(new Date(m.date)) === today);
  function confirmDelete(id: number) { Alert.alert("Eintrag löschen?", "Dieser Vorgang kann nicht rückgängig gemacht werden.", [{ text: "Abbrechen", style: "cancel" }, { text: "Löschen", style: "destructive", onPress: () => deleteMeal(id) }]); }
  return <><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}><View style={styles.header}><ScreenTitle title="Ernährung" subtitle="Heute erfasst" /><Pressable onPress={() => setAdding(true)} style={styles.add}><Ionicons name="add" size={28} color="white" /></Pressable></View>
    {todaysMeals.length === 0 ? <Card style={styles.empty}><Ionicons name="restaurant-outline" size={42} color={colors.green} /><Text style={[styles.emptyTitle, { color: p.text }]}>Noch keine Mahlzeit</Text><Text style={{ color: p.secondary, textAlign: "center" }}>Suche ein Lebensmittel oder trage seine Nährwerte manuell ein.</Text></Card> : null}
    {(Object.keys(titles) as MealKind[]).map(kind => { const section = todaysMeals.filter(m => m.kind === kind); if (!section.length) return null; const total = sumNutrition(section.flatMap(m => m.entries.map(e => e.nutrition))); return <View key={kind} style={{ gap: 10 }}><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: p.text }]}>{titles[kind]}</Text><Text style={{ color: p.secondary }}>{Math.round(total.calories)} kcal</Text></View>{section.map(meal => <Card key={meal.id}><View style={styles.mealRow}><View style={{ flex: 1 }}><Text style={{ color: p.text, fontSize: 16, fontWeight: "700" }}>{meal.title || meal.entries[0]?.foodName}</Text>{meal.entries.map(entry => <Text key={entry.id} style={{ color: p.secondary, marginTop: 4 }}>{entry.foodName} · {Math.round(entry.amountGrams)} g · {Math.round(entry.nutrition.calories)} kcal</Text>)}</View><Pressable onPress={() => confirmDelete(meal.id)} hitSlop={10}><Ionicons name="trash-outline" size={21} color={colors.red} /></Pressable></View></Card>)}</View>; })}
  </ScrollView><AddFoodModal visible={adding} onClose={() => setAdding(false)} /></>;
}
const styles = StyleSheet.create({ container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 30 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, add: { width: 48, height: 48, borderRadius: 18, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }, empty: { alignItems: "center", paddingVertical: 35 }, emptyTitle: { fontSize: 19, fontWeight: "800" }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }, sectionTitle: { fontSize: 20, fontWeight: "800" }, mealRow: { flexDirection: "row", alignItems: "center", gap: 12 } });
