import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Field, Pill, PrimaryButton, ScreenTitle } from "../components/UI";
import { ageFromBirthDate, calculateGoal } from "../lib/nutrition";
import { useApp } from "../state/AppContext";
import { colors, palette, spacing } from "../theme";
import { ActivityLevel, DietKind, GoalKind, Sex } from "../types";

const choices = {
  sex: [["female", "Weiblich"], ["male", "Männlich"], ["unspecified", "Keine Angabe"]] as const,
  activity: [["sedentary", "Kaum aktiv"], ["light", "Leicht"], ["moderate", "Moderat"], ["very", "Sehr aktiv"]] as const,
  goal: [["lose", "Abnehmen"], ["maintain", "Halten"], ["gain", "Muskelaufbau"]] as const,
  diet: [["normal", "Normal"], ["vegetarian", "Vegetarisch"], ["vegan", "Vegan"], ["pescetarian", "Pescetarisch"]] as const
};

export function OnboardingScreen() {
  const { completeOnboarding } = useApp(); const p = palette(useColorScheme());
  const [name, setName] = useState(""); const [birthDate, setBirthDate] = useState(""); const [height, setHeight] = useState("175"); const [weight, setWeight] = useState("75");
  const [sex, setSex] = useState<Sex>("unspecified"); const [activity, setActivity] = useState<ActivityLevel>("moderate"); const [goalKind, setGoalKind] = useState<GoalKind>("maintain"); const [diet, setDiet] = useState<DietKind>("normal");
  const [allergies, setAllergies] = useState(""); const [preferences, setPreferences] = useState(""); const [saving, setSaving] = useState(false);
  const estimate = useMemo(() => calculateGoal(Number(weight) || 75, Number(height) || 175, birthDate.match(/^\d{4}-\d{2}-\d{2}$/) ? ageFromBirthDate(birthDate) : 30, sex, activity, goalKind), [weight, height, birthDate, sex, activity, goalKind]);

  async function finish() {
    if (!name.trim() || Number(height) < 100 || Number(weight) < 30) return Alert.alert("Angaben prüfen", "Bitte gib einen Namen sowie eine plausible Größe und ein plausibles Gewicht ein.");
    setSaving(true);
    try { await completeOnboarding({ name: name.trim(), birthDate: birthDate || null, heightCm: Number(height), weightKg: Number(weight), sex, activity, goal: goalKind, diet, allergies: allergies.trim(), preferences: preferences.trim() }, estimate); }
    catch { Alert.alert("Speichern fehlgeschlagen", "Deine Angaben konnten nicht lokal gespeichert werden."); } finally { setSaving(false); }
  }

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: p.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={["#1AB471", "#0C7548"]} style={styles.hero}><Text style={styles.logo}>CalorieAI</Text><Text style={styles.heroTitle}>Dein Essen. Deine Ziele. Verständlich.</Text><Text style={styles.heroText}>Alle Angaben bleiben zunächst auf deinem Gerät. Werte sind Schätzungen und jederzeit anpassbar.</Text></LinearGradient>
      <ScreenTitle title="Lass uns starten" subtitle="Sensible oder optionale Angaben kannst du leer lassen." />
      <Field label="Wie dürfen wir dich nennen?" value={name} onChangeText={setName} placeholder="Name" autoComplete="name" />
      <Field label="Geburtsdatum – optional (JJJJ-MM-TT)" value={birthDate} onChangeText={setBirthDate} placeholder="1995-06-15" keyboardType="numbers-and-punctuation" />
      <View style={styles.row}><View style={{ flex: 1 }}><Field label="Größe (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /></View><View style={{ flex: 1 }}><Field label="Gewicht (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View></View>
      <Choice title="Biologisches Geschlecht für die Schätzung" values={choices.sex} selected={sex} onSelect={value => setSex(value as Sex)} />
      <Choice title="Aktivitätslevel" values={choices.activity} selected={activity} onSelect={value => setActivity(value as ActivityLevel)} />
      <Choice title="Dein Ziel" values={choices.goal} selected={goalKind} onSelect={value => setGoalKind(value as GoalKind)} />
      <Choice title="Ernährungsform" values={choices.diet} selected={diet} onSelect={value => setDiet(value as DietKind)} />
      <Field label="Allergien und Unverträglichkeiten – optional" value={allergies} onChangeText={setAllergies} placeholder="z. B. Erdnüsse, Laktose" />
      <Field label="Vorlieben – optional" value={preferences} onChangeText={setPreferences} placeholder="z. B. schnell, proteinreich" />
      <View style={[styles.estimate, { backgroundColor: p.card, borderColor: p.border }]}><Text style={{ color: p.secondary }}>Geschätztes Tagesziel</Text><Text style={[styles.kcal, { color: p.text }]}>{estimate.calories} kcal</Text><Text style={{ color: p.secondary }}>Protein {estimate.protein} g · Kohlenhydrate {estimate.carbs} g · Fett {estimate.fat} g</Text></View>
      <PrimaryButton title={saving ? "Wird gespeichert …" : "Im Gastmodus starten"} onPress={finish} disabled={saving} />
      <Text style={[styles.legal, { color: p.secondary }]}>CalorieAI ersetzt keine medizinische Beratung. Deine Daten werden lokal und offline gespeichert.</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Choice({ title, values, selected, onSelect }: { title: string; values: readonly (readonly [string, string])[]; selected: string; onSelect(value: string): void }) {
  const p = palette(useColorScheme()); return <View style={{ gap: 8 }}><Text style={{ color: p.secondary, fontSize: 13, fontWeight: "600" }}>{title}</Text><View style={styles.wrap}>{values.map(([value, label]) => <Pill key={value} title={label} selected={selected === value} onPress={() => onSelect(value)} />)}</View></View>;
}
const styles = StyleSheet.create({ container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 50 }, hero: { padding: 24, borderRadius: 26, gap: 10 }, logo: { color: "white", fontSize: 16, fontWeight: "800" }, heroTitle: { color: "white", fontSize: 28, lineHeight: 33, fontWeight: "800" }, heroText: { color: "#E5FFF2", lineHeight: 20 }, row: { flexDirection: "row", gap: 12 }, wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, estimate: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 5 }, kcal: { fontSize: 28, fontWeight: "800" }, legal: { textAlign: "center", fontSize: 12, lineHeight: 17 } });
