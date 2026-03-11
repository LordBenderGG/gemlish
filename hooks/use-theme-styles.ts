/**
 * useThemeStyles — Colores dinámicos del tema para StyleSheet
 */
import { useMemo } from 'react';
import { useColors } from './use-colors';

export function useThemeStyles() {
  const colors = useColors();

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
    gem: (colors as any).gem ?? '#22D3EE',
    purple: (colors as any).purple ?? '#A855F7',
    blue: (colors as any).blue ?? '#60A5FA',
    gold: (colors as any).gold ?? '#F59E0B',
    pink: (colors as any).pink ?? '#F472B6',
    surfaceAlt: colors.surface,
    // Gradientes como arrays para LinearGradient
    gradientPrimary: ['#7C3AED', '#A855F7'] as string[],
    gradientGold: ['#B45309', '#F59E0B'] as string[],
    gradientGem: ['#0891B2', '#22D3EE'] as string[],
    gradientSuccess: ['#059669', '#34D399'] as string[],
    gradientFire: ['#DC2626', '#F97316'] as string[],
    gradientNight: ['#0A0A14', '#12121F'] as string[],
    gradientCard: ['#1A1535', '#12121F'] as string[],
  }), [colors]);
}
