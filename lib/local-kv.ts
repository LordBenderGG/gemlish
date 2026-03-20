import { getDb } from './database';

export async function kvGet(key: string): Promise<string | null> {
  const db = getDb();
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM db_meta WHERE key = ?`,
    [key],
  );
  return row?.value ?? null;
}

export async function kvSet(key: string, value: string): Promise<void> {
  const db = getDb();
  db.runSync(
    `INSERT OR REPLACE INTO db_meta (key, value) VALUES (?, ?)`,
    [key, value],
  );
}

export async function kvRemove(key: string): Promise<void> {
  const db = getDb();
  db.runSync(`DELETE FROM db_meta WHERE key = ?`, [key]);
}

export async function kvGetJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await kvGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function kvSetJson(key: string, value: unknown): Promise<void> {
  await kvSet(key, JSON.stringify(value));
}
