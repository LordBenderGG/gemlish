/**
 * use-color-scheme.web.ts
 * Siempre retorna "light" — la app no tiene modo oscuro.
 */
export function useColorScheme() {
  return "light" as const;
}
