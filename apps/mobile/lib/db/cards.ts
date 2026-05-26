// cards.ts - Card CRUD operations
import { getDatabase } from './database';
import type { Card } from '../types';

export async function getAllCards(): Promise<Card[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM cards ORDER BY created_at DESC'
  );
  return rows.map(mapCard);
}

export async function getCardById(id: string): Promise<Card | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM cards WHERE id = ?',
    [id]
  );
  return row ? mapCard(row) : null;
}

export async function insertCard(
  card: Omit<Card, 'created_at'>
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO cards (id, name, last4, type, bank, color_start, color_end, balance, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      card.id,
      card.name,
      card.last4,
      card.type,
      card.bank,
      card.color_start,
      card.color_end,
      card.balance,
      card.is_active ? 1 : 0,
    ]
  );
}

export async function updateCard(
  id: string,
  updates: Partial<Omit<Card, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDatabase();
  const mapped: Record<string, any> = { ...updates };
  if ('is_active' in mapped) {
    mapped.is_active = mapped.is_active ? 1 : 0;
  }

  const fields = Object.keys(mapped);
  const values = Object.values(mapped);
  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  await db.runAsync(`UPDATE cards SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cards WHERE id = ?', [id]);
}

function mapCard(row: any): Card {
  return {
    ...row,
    is_active: row.is_active === 1,
  };
}
