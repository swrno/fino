// types.ts - shared type definitions
export interface Transaction {
  id: string;
  card_id: string | null;
  name: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  description: string | null;
  date: string; // ISO string
  source: 'manual' | 'sms';
  raw_sms: string | null;
  created_at: string;
}

export interface Card {
  id: string;
  name: string;
  last4: string;
  type: 'credit' | 'debit' | 'wallet';
  bank: string | null;
  color_start: string;
  color_end: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
}

export interface ParsedTransaction {
  amount: number;
  type: 'debit' | 'credit';
  name: string;
  category: string;
  date: string;
  source: 'sms';
  rawSms: string;
}
