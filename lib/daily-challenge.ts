/**
 * daily-challenge.ts — Lógica del Desafío del Día
 *
 * Cada día se selecciona un nivel aleatorio (entre los desbloqueados por el usuario)
 * usando la fecha como semilla para que sea consistente durante todo el día.
 * Al completarlo, el usuario recibe el doble de XP y diamantes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyChallenge {
  /** Fecha del desafío en formato YYYY-MM-DD */
  date: string;
  /** Número de nivel del desafío */
  levelId: number;
  /** Si el usuario ya completó el desafío hoy */
  completed: boolean;
  /** XP ganados al completar (ya incluye el multiplicador x2) */
  xpEarned: number;
  /** Diamantes ganados al completar (ya incluye el multiplicador x2) */
  gemsEarned: number;
}

const KEY = (username: string) => `gemlish_daily_challenge_${username}`;

// ─── Generador determinístico de nivel por fecha ─────────────────────────────

/**
 * Genera un número pseudoaleatorio entre min y max (inclusive)
 * usando la fecha como semilla. El resultado es el mismo para
 * todos los usuarios en el mismo día.
 */
function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  const normalized = Math.abs(hash) / 2147483647; // Normalizar a [0, 1)
  return Math.floor(normalized * (max - min + 1)) + min;
}

/**
 * Calcula el nivel del desafío del día.
 * Elige un nivel aleatorio entre los niveles desbloqueados por el usuario,
 * excluyendo el nivel 1 si hay más opciones disponibles.
 */
export function getDailyChallengeLevel(today: string, maxUnlockedLevel: number): number {
  const available = Math.max(1, maxUnlockedLevel);
  if (available === 1) return 1;
  // Elegir entre nivel 1 y el máximo desbloqueado
  return seededRandom(today, 1, available);
}

// ─── Persistencia ────────────────────────────────────────────────────────────

export async function getDailyChallenge(username: string): Promise<DailyChallenge | null> {
  const raw = await AsyncStorage.getItem(KEY(username));
  if (!raw) return null;
  return JSON.parse(raw) as DailyChallenge;
}

export async function saveDailyChallenge(username: string, challenge: DailyChallenge): Promise<void> {
  await AsyncStorage.setItem(KEY(username), JSON.stringify(challenge));
}

/**
 * Obtiene o crea el desafío del día.
 * Si ya existe uno para hoy, lo devuelve tal cual.
 * Si es un día nuevo, genera uno nuevo con el nivel correspondiente.
 */
export async function getOrCreateDailyChallenge(
  username: string,
  maxUnlockedLevel: number,
  baseXp: number,
  baseGems: number,
): Promise<DailyChallenge> {
  const today = new Date().toISOString().split('T')[0];
  const existing = await getDailyChallenge(username);

  // Si ya existe el desafío de hoy, devolverlo
  if (existing && existing.date === today) {
    return existing;
  }

  // Crear nuevo desafío para hoy
  const levelId = getDailyChallengeLevel(today, maxUnlockedLevel);
  const challenge: DailyChallenge = {
    date: today,
    levelId,
    completed: false,
    xpEarned: baseXp * 2,
    gemsEarned: baseGems * 2,
  };

  await saveDailyChallenge(username, challenge);
  return challenge;
}

/**
 * Marca el desafío del día como completado y devuelve las recompensas.
 * Devuelve null si ya estaba completado o si no existe.
 */
export async function completeDailyChallenge(
  username: string,
): Promise<{ xpEarned: number; gemsEarned: number } | null> {
  const challenge = await getDailyChallenge(username);
  const today = new Date().toISOString().split('T')[0];

  if (!challenge || challenge.date !== today || challenge.completed) {
    return null;
  }

  const updated: DailyChallenge = { ...challenge, completed: true };
  await saveDailyChallenge(username, updated);

  return { xpEarned: challenge.xpEarned, gemsEarned: challenge.gemsEarned };
}
