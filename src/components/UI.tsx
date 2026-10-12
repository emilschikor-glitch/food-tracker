import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, useColorScheme, View, ViewStyle } from "react-native";
import { colors, palette, spacing } from "../theme";

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const p = palette(useColorScheme());
  return <View style={{ gap: 4 }}><Text style={[styles.title, { color: p.text }]}>{title}</Text>{subtitle ? <Text style={[styles.subtitle, { color: p.secondary }]}>{subtitle}</Text> : null}</View>;
}
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const p = palette(useColorScheme()); return <View style={[styles.card, { backgroundColor: p.card, borderColor: p.border }, style]}>{children}</View>;
}
export function PrimaryButton({ title, onPress, disabled = false, variant = "solid" }: { title: string; onPress(): void; disabled?: boolean; variant?: "solid" | "outline" | "danger" }) {
  const p = palette(useColorScheme()); const backgroundColor = variant === "solid" ? colors.green : "transparent"; const borderColor = variant === "danger" ? colors.red : colors.green; const color = variant === "solid" ? "white" : variant === "danger" ? colors.red : colors.green;
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor, borderColor, opacity: disabled ? .45 : pressed ? .75 : 1 }]}><Text style={[styles.buttonText, { color }]}>{title}</Text></Pressable>;
}
export function Field(props: TextInputProps & { label: string }) {
  const p = palette(useColorScheme()); return <View style={{ gap: 7 }}><Text style={[styles.label, { color: p.secondary }]}>{props.label}</Text><TextInput placeholderTextColor={p.secondary} {...props} style={[styles.input, { color: p.text, backgroundColor: p.card, borderColor: p.border }, props.style]} /></View>;
}
export function Pill({ title, selected, onPress }: { title: string; selected: boolean; onPress(): void }) {
  const p = palette(useColorScheme()); return <Pressable onPress={onPress} style={[styles.pill, { backgroundColor: selected ? colors.green : p.card, borderColor: selected ? colors.green : p.border }]}><Text style={{ color: selected ? "white" : p.text, fontWeight: "600" }}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -.7 }, subtitle: { fontSize: 15, lineHeight: 21 },
  card: { padding: spacing.md, borderRadius: 22, borderWidth: 1, gap: 12, shadowColor: "#000", shadowOpacity: .04, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  button: { minHeight: 50, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 }, buttonText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600" }, input: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 }
});
