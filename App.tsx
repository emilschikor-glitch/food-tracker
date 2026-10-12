import React, { useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppProvider, useApp } from "./src/state/AppContext";
import { colors, palette } from "./src/theme";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { NutritionScreen } from "./src/screens/NutritionScreen";
import { ScannerScreen } from "./src/screens/ScannerScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";

export type TabName = "dashboard" | "nutrition" | "scanner" | "calendar" | "profile";
const tabs: Array<{ id: TabName; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "dashboard", label: "Dashboard", icon: "speedometer-outline" }, { id: "nutrition", label: "Ernährung", icon: "restaurant-outline" },
  { id: "scanner", label: "Scanner", icon: "scan-outline" }, { id: "calendar", label: "Kalender", icon: "calendar-outline" }, { id: "profile", label: "Profil", icon: "person-circle-outline" }
];

function AppContent() {
  const { ready, profile } = useApp(); const [tab, setTab] = useState<TabName>("dashboard"); const scheme = useColorScheme(); const p = palette(scheme);
  if (!ready) return <View style={[styles.loading, { backgroundColor: p.background }]}><ActivityIndicator size="large" color={colors.green} /><Text style={{ color: p.secondary }}>Lokale Daten werden geladen …</Text></View>;
  if (!profile) return <OnboardingScreen />;
  const content = tab === "dashboard" ? <DashboardScreen goTo={setTab} /> : tab === "nutrition" ? <NutritionScreen /> : tab === "scanner" ? <ScannerScreen /> : tab === "calendar" ? <CalendarScreen /> : <ProfileScreen />;
  return <SafeAreaView style={[styles.safe, { backgroundColor: p.background }]}>
    <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} />
    <View style={styles.content}>{content}</View>
    <View style={[styles.tabBar, { backgroundColor: p.card, borderTopColor: p.border }]}>{tabs.map(item => <View key={item.id} style={styles.tabItem} onTouchEnd={() => setTab(item.id)} accessibilityRole="tab" accessibilityState={{ selected: tab === item.id }}>
      <Ionicons name={item.icon} size={tab === item.id ? 25 : 23} color={tab === item.id ? colors.green : p.secondary} />
      <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: tab === item.id ? "700" : "500", color: tab === item.id ? colors.green : p.secondary }}>{item.label}</Text>
    </View>)}</View>
  </SafeAreaView>;
}

export default function App() { return <AppProvider><AppContent /></AppProvider>; }
const styles = StyleSheet.create({ safe: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }, loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }, content: { flex: 1 }, tabBar: { minHeight: 64, flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: Platform.OS === "ios" ? 4 : 6 }, tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 } });

