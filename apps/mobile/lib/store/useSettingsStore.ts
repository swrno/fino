// useSettingsStore.ts - Zustand store for app settings
import { create } from 'zustand';

interface SettingsStore {
  onboardingDone: boolean;
  currency: string;
  locale: string;
  smsAutoImport: boolean;
  defaultCardId: string | null;
  userName: string;
  userEmail: string;

  setOnboardingDone: (done: boolean) => void;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
  setSmsAutoImport: (enabled: boolean) => void;
  setDefaultCardId: (id: string | null) => void;
  setUserProfile: (name: string, email: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  onboardingDone: false,
  currency: 'INR',
  locale: 'en-IN',
  smsAutoImport: false,
  defaultCardId: null,
  userName: 'User',
  userEmail: '',

  setOnboardingDone: (done) => set({ onboardingDone: done }),
  setCurrency: (currency) => set({ currency }),
  setLocale: (locale) => set({ locale }),
  setSmsAutoImport: (enabled) => set({ smsAutoImport: enabled }),
  setDefaultCardId: (id) => set({ defaultCardId: id }),
  setUserProfile: (name, email) => set({ userName: name, userEmail: email }),
}));
