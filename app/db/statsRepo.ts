import { openDb } from './bootstrap';

export async function getStat(username: string, key: string): Promise<number> {
  const db = await openDb();
  const row = await db.getFirstAsync<{ value: number }>(`SELECT value FROM stats WHERE username=? AND key=?;`, [username, key]);
  return row?.value ?? 0;
}

export async function setStat(username: string, key: string, value: number): Promise<void> {
  const db = await openDb();
  await db.runAsync(
    `INSERT INTO stats(username, key, value, updated_at)
     VALUES(?, ?, ?, ?)
     ON CONFLICT(username, key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;`,
    [username, key, value, Date.now()]
  );
}

export async function incrementStat(username: string, key: string, delta = 1): Promise<number> {
  const current = await getStat(username, key);
  const next = current + delta;
  await setStat(username, key, next);
  return next;
}


