/**
 * useThemeStyles — Colores dinámicos del tema para StyleSheet
 * v4.0 — Solo modo CLARO, sin lógica de modo oscuro
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
    isDark: false,
    // Colores de acento vibrantes
    gem: '#4F46E5',
    purple: '#8B5CF6',
    blue: '#4F46E5',
    gold: '#F59E0B',
    pink: '#8B5CF6',
    orange: '#F59E0B',
    green: '#10B981',
    surfaceAlt: '#EFF6FF',
    // Gradientes modo CLARO (vibrantes)
    gradientPrimary: ['#4F46E5', '#818CF8'] as string[],
    gradientGold: ['#F59E0B', '#FCD34D'] as string[],
    gradientGem: ['#4F46E5', '#C7D2FE'] as string[],
    gradientSuccess: ['#10B981', '#6EE7B7'] as string[],
    gradientFire: ['#F59E0B', '#FDE68A'] as string[],
    gradientNight: ['#EFF6FF', '#DBEAFE'] as string[],
    gradientCard: ['#FFFFFF', '#EFF6FF'] as string[],
    gradientHeader: ['#4F46E5', '#7C3AED'] as string[],
  }), [colors]);
}
