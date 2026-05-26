// app/(onboarding)/index.tsx - Welcome screen
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { spacing } from '../../lib/theme/spacing';
import { Button } from '../../components/ui/Button';
import { AuroraBlob } from '../../components/onboarding/AuroraBlob';
import { ProgressDots } from '../../components/onboarding/ProgressDots';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Aurora illustration */}
      <AuroraBlob />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.title}>Track Every Rupee.</Text>
          <Text style={styles.titleAccent}>Effortlessly.</Text>
          <Text style={styles.subtitle}>
            Understand where your money goes.{'\n'}
            Auto-read bank SMS. Zero manual effort.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Get Started"
            onPress={() => router.push('/(onboarding)/permissions')}
          />
          <Button
            label="Skip"
            variant="ghost"
            onPress={() => router.push('/(onboarding)/ready')}
          />
        </View>

        <ProgressDots total={3} current={0} />
      </View>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'flex-end',
    gap: 28,
  },
  textSection: {
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: colors.textPrimary,
    lineHeight: 42,
  },
  titleAccent: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: colors.purple,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textSec,
    lineHeight: 22,
    marginTop: 8,
  },
  actions: {
    gap: 8,
  },
});
