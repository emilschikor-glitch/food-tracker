import React from "react";
import { Text, useColorScheme, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, palette } from "../theme";

export function NutritionRing({ consumed, target }: { consumed: number; target: number }) {
  const p = palette(useColorScheme()); const size = 190; const stroke = 15; const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius; const ratio = Math.min(Math.max(consumed / Math.max(target, 1), 0), 1);
  return <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${Math.round(consumed)} von ${Math.round(target)} Kilokalorien`}>
    <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}><Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={p.border} strokeWidth={stroke} /><Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.green} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - ratio)} /></Svg>
    <Text style={{ color: p.secondary, fontSize: 13 }}>verbleibend</Text><Text style={{ color: p.text, fontSize: 34, fontWeight: "800" }}>{Math.round(target - consumed)}</Text><Text style={{ color: p.secondary, fontSize: 13 }}>kcal</Text>
  </View>;
}

