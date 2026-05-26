// transactions.ts - Transaction CRUD operations
import { getDatabase } from './database';
import type { Transaction } from '../types';

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC'
  );
  return rows;
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  return row ?? null;
}

export async function getTransactionsByPeriod(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [startDate, endDate]
  );
}

export async function getTransactionsByCard(cardId: string): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE card_id = ? ORDER BY date DESC',
    [cardId]
  );
}

export async function getCategoryTotals(
  startDate: string,
  endDate: string,
  type: 'debit' | 'credit' = 'debit'
): Promise<Record<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ category: string; total: number }>(
    `SELECT category, SUM(amount) as total
     FROM transactions
     WHERE date >= ? AND date <= ? AND type = ?
     GROUP BY category
     ORDER BY total DESC`,
    [startDate, endDate, type]
  );
  return Object.fromEntries(rows.map((r) => [r.category, r.total]));
}

export async function insertTransaction(
  tx: Omit<Transaction, 'created_at'>
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO transactions (id, card_id, name, amount, type, category, description, date, source, raw_sms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tx.id,
      tx.card_id,
      tx.name,
      tx.amount,
      tx.type,
      tx.category,
      tx.description,
      tx.date,
      tx.source,
      tx.raw_sms,
    ]
  );
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDatabase();
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  await db.runAsync(
    `UPDATE transactions SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getTotalByType(
  type: 'debit' | 'credit',
  startDate?: string,
  endDate?: string
): Promise<number> {
  const db = await getDatabase();
  let query = 'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ?';
  const params: (string)[] = [type];

  if (startDate && endDate) {
    query += ' AND date >= ? AND date <= ?';
    params.push(startDate, endDate);
  }

  const row = await db.getFirstAsync<{ total: number }>(query, params);
  return row?.total ?? 0;
}
