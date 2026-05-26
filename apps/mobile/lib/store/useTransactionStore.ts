// useTransactionStore.ts - Zustand store for transactions
import { create } from 'zustand';
import type { Transaction } from '../types';
import * as txDb from '../db/transactions';
import { getPeriodRange, type Period } from '../utils/date';

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAll: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Selectors (computed from transactions array)
  getByPeriod: (period: Period) => Transaction[];
  getByCategory: (category: string) => Transaction[];
  getCategoryTotals: (period: Period, type?: 'debit' | 'credit') => Record<string, number>;
  getTotalBalance: () => number;
  getTotalExpenses: (period: Period) => number;
  getTotalIncome: (period: Period) => number;
  getRecentTransactions: (count?: number) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await txDb.getAllTransactions();
      set({ transactions, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addTransaction: async (tx) => {
    try {
      await txDb.insertTransaction(tx);
      const transactions = await txDb.getAllTransactions();
      set({ transactions });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      await txDb.updateTransaction(id, updates);
      const transactions = await txDb.getAllTransactions();
      set({ transactions });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteTransaction: async (id) => {
    try {
      await txDb.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  getByPeriod: (period) => {
    const { start, end } = getPeriodRange(period);
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    return get().transactions.filter(
      (t) => t.date >= startStr && t.date <= endStr
    );
  },

  getByCategory: (category) => {
    return get().transactions.filter((t) => t.category === category);
  },

  getCategoryTotals: (period, type = 'debit') => {
    const txs = get().getByPeriod(period).filter((t) => t.type === type);
    const totals: Record<string, number> = {};
    txs.forEach((t) => {
      totals[t.category] = (totals[t.category] ?? 0) + t.amount;
    });
    return totals;
  },

  getTotalBalance: () => {
    const txs = get().transactions;
    return txs.reduce((sum, t) => {
      return sum + (t.type === 'credit' ? t.amount : -t.amount);
    }, 0);
  },

  getTotalExpenses: (period) => {
    return get()
      .getByPeriod(period)
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalIncome: (period) => {
    return get()
      .getByPeriod(period)
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getRecentTransactions: (count = 5) => {
    return get().transactions.slice(0, count);
  },
}));
