import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

const THEME_KEY = "@gemlish_theme_v3";
const DEFAULT_SCHEME: ColorScheme = "light"; // MODO CLARO por defecto

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isManual: boolean;
  resetToSystem: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(DEFAULT_SCHEME);
  const [isManual, setIsManual] = useState(false);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      const scheme: ColorScheme = (saved === "dark" || saved === "light") ? saved : DEFAULT_SCHEME;
      setColorSchemeState(scheme);
      setIsManual(!!saved);
      applyScheme(scheme);
    });
  }, [applyScheme]);

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    setIsManual(true);
    applyScheme(scheme);
    await AsyncStorage.setItem(THEME_KEY, scheme);
  }, [applyScheme]);

  const resetToSystem = useCallback(async () => {
    const system = (Appearance.getColorScheme() as ColorScheme) ?? DEFAULT_SCHEME;
    setColorSchemeState(system);
    setIsManual(false);
    applyScheme(system);
    await AsyncStorage.removeItem(THEME_KEY);
  }, [applyScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({ colorScheme, setColorScheme, isManual, resetToSystem }),
    [colorScheme, setColorScheme, isManual, resetToSystem],
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
