import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { palette } from "../theme";

export function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const p = palette(useColorScheme()); const ratio = Math.min(Math.max(value / Math.max(target, 1), 0), 1);
  return <View style={{ gap: 7 }} accessibilityLabel={`${label}: ${Math.round(value)} von ${Math.round(target)} Gramm`}><View style={styles.row}><Text style={{ color: p.text, fontWeight: "600" }}>{label}</Text><Text style={{ color: p.secondary, fontSize: 12 }}>{Math.round(value)} / {Math.round(target)} g</Text></View><View style={[styles.track, { backgroundColor: p.border }]}><View style={[styles.fill, { backgroundColor: color, width: `${ratio * 100}%` }]} /></View></View>;
}
const styles = StyleSheet.create({ row: { flexDirection: "row", justifyContent: "space-between" }, track: { height: 8, borderRadius: 99, overflow: "hidden" }, fill: { height: "100%", borderRadius: 99 } });

