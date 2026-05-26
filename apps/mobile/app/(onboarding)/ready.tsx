// app/(onboarding)/ready.tsx - "You're all set" screen
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { spacing } from '../../lib/theme/spacing';
import { Button } from '../../components/ui/Button';
import { CreditCard } from '../../components/home/CreditCard';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { useSettingsStore } from '../../lib/store/useSettingsStore';
import * as Haptics from 'expo-haptics';

export default function ReadyScreen() {
  const router = useRouter();
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone);
  const checkAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(30)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: check → card → CTA
    Animated.sequence([
      // Check mark appears
      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      // Card slides up
      Animated.parallel([
        Animated.spring(cardAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // CTA slides up
      Animated.parallel([
        Animated.spring(ctaAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [checkAnim, cardAnim, cardOpacity, ctaAnim, ctaOpacity]);

  const handleStart = () => {
    setOnboardingDone(true);
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View
          style={[
            styles.checkContainer,
            {
              transform: [{ scale: checkAnim }],
              opacity: checkAnim,
            },
          ]}
        >
          <View style={styles.checkCircle}>
            <Feather name="check" size={36} color={colors.purple} />
          </View>
        </Animated.View>

        {/* Title */}
        <View style={styles.textSection}>
          <Text style={styles.title}>You're ready.</Text>
          <Text style={styles.subtitle}>
            Your first card is set up. Bank SMS will{'\n'}
            auto-populate your transactions.
          </Text>
        </View>

        {/* Card preview */}
        <Animated.View
          style={{
            transform: [{ translateY: cardAnim }],
            opacity: cardOpacity,
          }}
        >
          <CreditCard
            name="HDFC Platinum"
            last4="6510"
            balance={48520.75}
          />
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View
        style={[
          styles.actions,
          {
            transform: [{ translateY: ctaAnim }],
            opacity: ctaOpacity,
          },
        ]}
      >
        <Button label="Start Tracking" onPress={handleStart} />
        <ProgressDots total={3} current={2} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  checkContainer: {
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: 16,
  },
});
