import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { Appearance, View } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

const THEME_KEY = "@gemlish_theme_v3";
// Siempre modo claro — el modo oscuro fue eliminado de la app
const FORCED_SCHEME: ColorScheme = "light";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isManual: boolean;
  resetToSystem: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const applyLight = useCallback(() => {
    nativewindColorScheme.set("light");
    Appearance.setColorScheme?.("light");
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = "light";
      root.classList.remove("dark");
      const palette = SchemeColors["light"];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  // Al iniciar: borrar cualquier tema oscuro guardado y forzar claro
  useEffect(() => {
    AsyncStorage.removeItem(THEME_KEY);
    applyLight();
  }, [applyLight]);

  // setColorScheme y resetToSystem son no-ops: siempre claro
  const setColorScheme = useCallback(async (_scheme: ColorScheme) => {
    applyLight();
    await AsyncStorage.removeItem(THEME_KEY);
  }, [applyLight]);

  const resetToSystem = useCallback(async () => {
    applyLight();
    await AsyncStorage.removeItem(THEME_KEY);
  }, [applyLight]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors["light"].primary,
        "color-background": SchemeColors["light"].background,
        "color-surface": SchemeColors["light"].surface,
        "color-foreground": SchemeColors["light"].foreground,
        "color-muted": SchemeColors["light"].muted,
        "color-border": SchemeColors["light"].border,
        "color-success": SchemeColors["light"].success,
        "color-warning": SchemeColors["light"].warning,
        "color-error": SchemeColors["light"].error,
      }),
    [],
  );

  const value = useMemo(
    () => ({ colorScheme: FORCED_SCHEME, setColorScheme, isManual: false, resetToSystem }),
    [setColorScheme, resetToSystem],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
