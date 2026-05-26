// app/(onboarding)/permissions.tsx - SMS permissions screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { Button } from '../../components/ui/Button';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { useSettingsStore } from '../../lib/store/useSettingsStore';

export default function PermissionsScreen() {
  const router = useRouter();
  const setSmsAutoImport = useSettingsStore((s) => s.setSmsAutoImport);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const canReadSms = Platform.OS === 'android';

  const handleGrantAccess = async () => {
    if (smsEnabled && canReadSms) {
      setSmsAutoImport(true);
    }
    router.push('/(onboarding)/ready');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <Feather name="message-square" size={40} color={colors.purple} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Auto-Track{'\n'}Bank Messages</Text>
          <Text style={styles.subtitle}>
            We read bank SMS only. No personal messages.{'\n'}
            No data leaves your phone. Ever.
          </Text>
        </View>

        {/* Permission cards */}
        <View style={styles.permissions}>
          {canReadSms && (
            <View style={styles.permCard}>
              <View style={styles.permIconBg}>
                <Feather name="mail" size={20} color={colors.purple} />
              </View>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>Read SMS</Text>
                <Text style={styles.permSubtitle}>Auto-detect transactions</Text>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: colors.surfaceAlt, true: colors.purple }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          <View style={styles.permCard}>
            <View style={styles.permIconBg}>
              <Feather name="bell" size={20} color={colors.purple} />
            </View>
            <View style={styles.permInfo}>
              <Text style={styles.permTitle}>Notifications</Text>
              <Text style={styles.permSubtitle}>Get spending alerts</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: colors.surfaceAlt, true: colors.purple }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.noteCard}>
          <Feather name="lock" size={14} color={colors.textSec} />
          <Text style={styles.noteText}>
            All data stays on your device. No cloud sync without your consent.
          </Text>
        </View>

        {!canReadSms && (
          <View style={styles.noteCard}>
            <Feather name="info" size={14} color={colors.warning} />
            <Text style={styles.noteText}>
              SMS reading is not available on iOS. You can add transactions manually.
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button label="Grant Access" onPress={handleGrantAccess} />
        <Button
          label="I'll add manually"
          variant="ghost"
          onPress={() => router.push('/(onboarding)/ready')}
        />
        <ProgressDots total={3} current={1} />
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
    paddingTop: spacing.xxxl,
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.purpleMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissions: {
    gap: 10,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: 12,
  },
  permIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.purpleMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permInfo: {
    flex: 1,
    gap: 2,
  },
  permTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  permSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSec,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSec,
    lineHeight: 16,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: 8,
  },
});
