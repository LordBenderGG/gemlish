/** @type {const} */
const themeColors = {
  // Modo CLARO por defecto — fondo blanco, colores vibrantes
  primary:    { light: '#4F46E5', dark: '#818CF8' },   // índigo vibrante
  background: { light: '#F8FAFF', dark: '#0F172A' },   // blanco azulado / azul marino profundo
  surface:    { light: '#FFFFFF', dark: '#1E293B' },   // blanco puro / azul oscuro
  foreground: { light: '#1E293B', dark: '#F1F5F9' },   // casi negro / casi blanco
  muted:      { light: '#64748B', dark: '#94A3B8' },   // gris azulado
  border:     { light: '#E2E8F0', dark: '#334155' },   // gris claro / gris oscuro
  success:    { light: '#10B981', dark: '#34D399' },   // verde esmeralda
  warning:    { light: '#F59E0B', dark: '#FBBF24' },   // ámbar
  error:      { light: '#EF4444', dark: '#F87171' },   // rojo
  tint:       { light: '#4F46E5', dark: '#818CF8' },   // alias de primary para tabs
};

module.exports = { themeColors };
