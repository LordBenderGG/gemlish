/**
 * use-color-scheme.ts
 * Siempre retorna "light" — la app no tiene modo oscuro.
 * El ThemeProvider también fuerza light, pero este hook
 * es la fuente de verdad para todos los componentes.
 */
export function useColorScheme() {
  return "light" as const;
}
