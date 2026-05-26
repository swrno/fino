// app/_layout.tsx - Root layout: fonts, DB init, StatusBar
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from '../lib/db/database';
import { useSettingsStore } from '../lib/store/useSettingsStore';
import { useTransactionStore } from '../lib/store/useTransactionStore';
import { useCardStore } from '../lib/store/useCardStore';
import { colors } from '../lib/theme/colors';
import { SEED_CARD, SEED_CARD_2, SEED_TRANSACTIONS } from '../lib/utils/seed';
import { insertCard } from '../lib/db/cards';
import { insertTransaction } from '../lib/db/transactions';

// Prevent splash screen from hiding until fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  // Initialize database + seed data
  useEffect(() => {
    async function init() {
      try {
        const db = await getDatabase();
        // Check if cards exist, if not seed demo data
        const existingCards = await db.getAllAsync('SELECT id FROM cards LIMIT 1');
        if (existingCards.length === 0) {
          await insertCard(SEED_CARD);
          await insertCard(SEED_CARD_2);
          for (const tx of SEED_TRANSACTIONS) {
            await insertTransaction(tx);
          }
        }
        setDbReady(true);
      } catch (e) {
        console.error('DB init error:', e);
        setDbReady(true); // continue anyway
      }
    }
    init();
  }, []);

  // Load stores once DB is ready
  useEffect(() => {
    if (dbReady) {
      useTransactionStore.getState().fetchAll();
      useCardStore.getState().fetchAll();
    }
  }, [dbReady]);

  // Handle routing based on onboarding state
  useEffect(() => {
    if (!fontsLoaded || !dbReady) return;

    const inOnboarding = segments[0] === '(onboarding)';

    if (!onboardingDone && !inOnboarding) {
      router.replace('/(onboarding)/');
    } else if (onboardingDone && inOnboarding) {
      router.replace('/(tabs)/');
    }
  }, [fontsLoaded, dbReady, onboardingDone, segments, router]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
