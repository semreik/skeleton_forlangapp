import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync('app.db');
  dbInstance = db;
  return db;
}


