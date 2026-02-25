import { openDb } from './bootstrap';

export type StoredUser = {
  username: string;
  password_hash: string;
  salt: string;
  iters: number;
  created_at: number;
};

export async function createUser(u: StoredUser): Promise<void> {
  const db = await openDb();
  await db.runAsync(
    `INSERT INTO users(username, password_hash, salt, iters, created_at) VALUES (?, ?, ?, ?, ?);`,
    [u.username, u.password_hash, u.salt, u.iters, u.created_at]
  );
}

export async function getUser(username: string): Promise<StoredUser | null> {
  const db = await openDb();
  const row = await db.getFirstAsync<StoredUser>(`SELECT * FROM users WHERE username = ?;`, [username]);
  return row ?? null;
}


