// database.ts - SQLite database initialization
import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('trackr.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(SCHEMA_SQL);
  return db;
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('DROP TABLE IF EXISTS transactions;');
  await database.execAsync('DROP TABLE IF EXISTS cards;');
  await database.execAsync(SCHEMA_SQL);
}
