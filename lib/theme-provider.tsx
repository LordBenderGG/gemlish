import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { Appearance, View } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

// Modo oscuro forzado permanentemente
const FORCED_SCHEME: ColorScheme = "dark";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isManual: boolean;
  resetToSystem: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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

  // Aplicar modo oscuro al montar y mantenerlo siempre
  useEffect(() => {
    applyScheme(FORCED_SCHEME);
  }, [applyScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[FORCED_SCHEME].primary,
        "color-background": SchemeColors[FORCED_SCHEME].background,
        "color-surface": SchemeColors[FORCED_SCHEME].surface,
        "color-foreground": SchemeColors[FORCED_SCHEME].foreground,
        "color-muted": SchemeColors[FORCED_SCHEME].muted,
        "color-border": SchemeColors[FORCED_SCHEME].border,
        "color-success": SchemeColors[FORCED_SCHEME].success,
        "color-warning": SchemeColors[FORCED_SCHEME].warning,
        "color-error": SchemeColors[FORCED_SCHEME].error,
      }),
    [],
  );

  const value = useMemo(
    () => ({
      colorScheme: FORCED_SCHEME,
      // Los siguientes son no-ops: el modo oscuro es permanente
      setColorScheme: (_scheme: ColorScheme) => {},
      isManual: true,
      resetToSystem: () => {},
    }),
    [],
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
