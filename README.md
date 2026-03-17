# 🌟 Gemlish — Aprende Inglés Jugando

> **500 niveles · 100% gratis · Sin suscripción · Sin tarjeta**

Gemlish es una aplicación móvil para aprender inglés de forma divertida y progresiva. Con más de **400 lecciones reales** (4.000 palabras), ejercicios interactivos y un sistema de progresión gamificado, aprender inglés nunca fue tan fácil.

---

## 📱 Capturas de pantalla

| Inicio | Tarea Diaria | Juego | Perfil |
|--------|-------------|-------|--------|
| Mapa de niveles con 500 niveles | Quiz diario de 10 palabras | Juego de memoria, ordenar, completar | Estadísticas y racha |

---

## ✨ Características

- **500 niveles** con progresión de dificultad gradual (básico → avanzado especializado)
- **400 lecciones reales** — el reciclaje de contenido empieza recién en el nivel 401
- **Tarea diaria** — 10 palabras nuevas por día con quiz interactivo
- **3 tipos de ejercicios:** completar la oración, ordenar palabras, juego de memoria
- **Pronunciación fonética en español** — para hispanohablantes
- **Sistema de racha** — motivación diaria para no perder el hábito
- **Diamantes y XP** — recompensas por completar lecciones
- **Modo oscuro** — soporte completo para light/dark mode
- **100% offline** — no requiere conexión para estudiar
- **Completamente gratis** — sin suscripción, sin tarjeta de crédito

---

## 🗂️ Contenido del curso

El curso cubre **400 temas** organizados por dificultad:

| Niveles | Categoría | Ejemplos de temas |
|---------|-----------|-------------------|
| 1–50 | **Básico** | Saludos, Números, Colores, Familia, Animales, Comida |
| 51–100 | **Intermedio-bajo** | Trabajo, Viajes, Tecnología, Salud, Deportes |
| 101–150 | **Intermedio** | Negocios, Phrasal Verbs I-II, Idioms básicos |
| 151–200 | **Intermedio-alto** | Finanzas, Derecho básico, Ciencia, Cultura |
| 201–250 | **Avanzado cotidiano** | Modismos americanos, Inglés formal, Negociación |
| 251–300 | **Avanzado** | Medicina, Psicología, Filosofía, Arte |
| 301–350 | **Avanzado especializado** | IA, Blockchain, Ciberseguridad, Derecho internacional |
| 351–400 | **Muy avanzado** | Neurociencia, Física cuántica, Proverbios, Retórica |

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React Native** | 0.81 | Framework móvil |
| **Expo SDK** | 54 | Plataforma de desarrollo |
| **TypeScript** | 5.9 | Tipado estático |
| **NativeWind** | 4 | Estilos con Tailwind CSS |
| **Expo Router** | 6 | Navegación |
| **React Native Reanimated** | 4.x | Animaciones |
| **AsyncStorage** | 2.x | Persistencia local |
| **AdMob** | — | Monetización |

---

## 🚀 Instalación y desarrollo

### Requisitos previos

- Node.js 18+
- pnpm 9+
- Expo CLI
- iOS Simulator o Android Emulator (o dispositivo físico con Expo Go)

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/LordBenderGG/gemlish.git
cd gemlish

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

### Ejecutar en dispositivo físico

```bash
# Generar QR para Expo Go
pnpm qr
```

Escanea el QR con la app **Expo Go** en tu dispositivo.

---

## 📁 Estructura del proyecto

```
gemlish/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        ← Pantalla principal (mapa de niveles)
│   │   ├── daily.tsx        ← Tarea diaria
│   │   ├── game.tsx         ← Juegos interactivos
│   │   └── profile.tsx      ← Perfil y estadísticas
│   └── _layout.tsx          ← Layout raíz
├── components/
│   ├── AdBanner.tsx         ← Componente de anuncios
│   ├── screen-container.tsx ← Contenedor con SafeArea
│   └── ui/                  ← Componentes de UI reutilizables
├── data/
│   ├── lessons.ts           ← 400 lecciones (4.000 palabras)
│   └── exerciseGenerator.ts ← Generador de ejercicios
├── hooks/
│   ├── useAdMob.ts          ← Hook para AdMob
│   └── use-colors.ts        ← Hook de tema
├── lib/
│   └── storage.ts           ← Gestión de progreso local
├── assets/
│   └── images/              ← Iconos y splash screen
├── theme.config.js          ← Paleta de colores
└── app.config.ts            ← Configuración de Expo
```

---

## 🎮 Sistema de ejercicios

### Tipos de ejercicios

1. **Completar la oración** — Se muestra una oración con una palabra faltante y 4 opciones
2. **Ordenar palabras** — Se muestran palabras desordenadas para formar una oración correcta
3. **Juego de memoria** — Emparejar la palabra en inglés con su traducción al español

### Generación de ejercicios

Los ejercicios se generan dinámicamente en `data/exerciseGenerator.ts` usando las palabras de la lección activa. Los distractores se seleccionan de palabras de lecciones cercanas para mantener el nivel de dificultad apropiado.

---

## 📊 Sistema de progresión

```
Nivel del juego → Lección real
Nivel 1   → Lección 1  (Saludos básicos)
Nivel 50  → Lección 50 (Phrasal Verbs I)
Nivel 100 → Lección 100 (Inglés de Negocios IV)
Nivel 200 → Lección 200 (Inglés Médico Avanzado)
Nivel 400 → Lección 400 (Retórica y Oratoria)
Nivel 401+ → Reciclaje desde lección 1
```

---

## 🌍 Internacionalización

La app está diseñada específicamente para **hispanohablantes**:

- Todas las traducciones en español neutro (comprensible en toda Latinoamérica y España)
- Pronunciaciones en **fonética española simplificada** (ej: `YELO` para "yellow", `ZANKS` para "thanks")
- Ejemplos contextualizados para la cultura hispanohablante

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados © 2025 Gemlish.

---

## 👤 Autor

Desarrollado con ❤️ para hispanohablantes que quieren aprender inglés sin excusas.

**¿Encontraste un bug?** Abre un issue en este repositorio.
