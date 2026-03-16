/**
 * useThemeStyles — Colores dinámicos del tema para StyleSheet
 * v3.0 — Paleta CLARA y vibrante
 */
import { useMemo } from 'react';
import { useColors } from './use-colors';
import { useColorScheme } from './use-color-scheme';

export function useThemeStyles() {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return useMemo(() => ({
    bg: colors.background,
    surface: colors.surface,
    border: colors.border,
    text: colors.foreground,
    muted: colors.muted,
    primary: colors.primary,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    isDark,
    // Colores de acento vibrantes
    gem: '#4F46E5',          // cian vibrante para diamantes
    purple: '#8B5CF6',       // violeta vibrante
    blue: '#4F46E5',         // azul vibrante
    gold: '#F59E0B',         // dorado ámbar
    pink: '#8B5CF6',         // rosa vibrante
    orange: '#F59E0B',       // naranja
    green: '#10B981',        // verde esmeralda
    surfaceAlt: isDark ? '#1E293B' : '#EFF6FF',
    // Gradientes modo CLARO (vibrantes) / modo OSCURO (profundos)
    gradientPrimary: isDark
      ? ['#312E81', '#4F46E5'] as string[]
      : ['#4F46E5', '#818CF8'] as string[],
    gradientGold: isDark
      ? ['#78350F', '#F59E0B'] as string[]
      : ['#F59E0B', '#FCD34D'] as string[],
    gradientGem: isDark
      ? ['#EFF6FF', '#4F46E5'] as string[]
      : ['#4F46E5', '#C7D2FE'] as string[],
    gradientSuccess: isDark
      ? ['#064E3B', '#10B981'] as string[]
      : ['#10B981', '#6EE7B7'] as string[],
    gradientFire: isDark
      ? ['#FEF3C7', '#F59E0B'] as string[]
      : ['#F59E0B', '#FDE68A'] as string[],
    gradientNight: isDark
      ? ['#0F172A', '#1E293B'] as string[]
      : ['#EFF6FF', '#DBEAFE'] as string[],
    gradientCard: isDark
      ? ['#1E293B', '#0F172A'] as string[]
      : ['#FFFFFF', '#EFF6FF'] as string[],
    gradientHeader: isDark
      ? ['#1E293B', '#0F172A'] as string[]
      : ['#4F46E5', '#7C3AED'] as string[],
  }), [colors, isDark]);
}
