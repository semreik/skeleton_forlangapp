// Use platform resolver (sqlite.native.ts / sqlite.web.ts)
import { openDb as openPlatformDb } from '../../lib/db/sqlite';

let _migrated = false;

export async function openDb() {
  const db = await openPlatformDb();
  if (!_migrated) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        iters INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        key TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL,
        UNIQUE(username, key),
        FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
      );
    `);
    _migrated = true;
  }
  return db;
}
