// schema.ts - SQLite table definitions
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS cards (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  last4       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('credit', 'debit', 'wallet')),
  bank        TEXT,
  color_start TEXT DEFAULT '#8B5CF6',
  color_end   TEXT DEFAULT '#06B6D4',
  balance     REAL DEFAULT 0,
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY,
  card_id     TEXT REFERENCES cards(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  amount      REAL NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('debit', 'credit')),
  category    TEXT NOT NULL,
  description TEXT,
  date        TEXT NOT NULL,
  source      TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'sms')),
  raw_sms     TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_card ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);
`;
