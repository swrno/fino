// useCardStore.ts - Zustand store for cards
import { create } from 'zustand';
import type { Card } from '../types';
import * as cardDb from '../db/cards';

interface CardStore {
  cards: Card[];
  isLoading: boolean;
  selectedCardId: string | null;

  fetchAll: () => Promise<void>;
  addCard: (card: Omit<Card, 'created_at'>) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  selectCard: (id: string | null) => void;
  getSelectedCard: () => Card | null;
  getActiveCards: () => Card[];
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  isLoading: false,
  selectedCardId: null,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const cards = await cardDb.getAllCards();
      set({ cards, isLoading: false });
      // Auto-select first card if none selected
      if (!get().selectedCardId && cards.length > 0) {
        set({ selectedCardId: cards[0].id });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addCard: async (card) => {
    await cardDb.insertCard(card);
    const cards = await cardDb.getAllCards();
    set({ cards });
    if (!get().selectedCardId) {
      set({ selectedCardId: card.id });
    }
  },

  updateCard: async (id, updates) => {
    await cardDb.updateCard(id, updates);
    const cards = await cardDb.getAllCards();
    set({ cards });
  },

  deleteCard: async (id) => {
    await cardDb.deleteCard(id);
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
    }));
  },

  selectCard: (id) => set({ selectedCardId: id }),

  getSelectedCard: () => {
    const { cards, selectedCardId } = get();
    return cards.find((c) => c.id === selectedCardId) ?? cards[0] ?? null;
  },

  getActiveCards: () => {
    return get().cards.filter((c) => c.is_active);
  },
}));
