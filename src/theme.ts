import { ColorSchemeName } from "react-native";

export const colors = {
  green: "#29AD70", greenDark: "#168153", mint: "#DFF6EA", orange: "#F59E42", red: "#E45B5B",
  light: { background: "#F4F7F5", card: "#FFFFFF", text: "#132019", secondary: "#68756D", border: "#E3E9E5" },
  dark: { background: "#0E1511", card: "#18231D", text: "#F3F8F5", secondary: "#A8B7AE", border: "#29382F" }
};
export const palette = (scheme: ColorSchemeName) => scheme === "dark" ? colors.dark : colors.light;
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };

