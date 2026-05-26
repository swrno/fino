// app/(tabs)/settings.tsx - Settings tab
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { useSettingsStore } from '../../lib/store/useSettingsStore';
import { useCardStore } from '../../lib/store/useCardStore';
import { resetDatabase } from '../../lib/db/database';
import { useTransactionStore } from '../../lib/store/useTransactionStore';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  trailing,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowIcon}>
        <Feather name={icon as any} size={18} color={colors.purple} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {trailing ?? (
        onPress && <Feather name="chevron-right" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    userName,
    userEmail,
    smsAutoImport,
    setSmsAutoImport,
    currency,
    setOnboardingDone,
  } = useSettingsStore();
  const cards = useCardStore((s) => s.cards);
  const fetchTransactions = useTransactionStore((s) => s.fetchAll);
  const fetchCards = useCardStore((s) => s.fetchAll);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your transactions and cards. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetDatabase();
            await fetchTransactions();
            await fetchCards();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Profile section */}
        <View style={styles.section}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>
                {userEmail || 'Set up your email'}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </View>
        </View>

        {/* Cards section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards</Text>
          {cards.map((card) => (
            <SettingsRow
              key={card.id}
              icon="credit-card"
              label={card.name}
              value={`•••• ${card.last4}`}
              onPress={() => router.push(`/card/${card.id}`)}
            />
          ))}
          <SettingsRow
            icon="plus-circle"
            label="Add Card"
            onPress={() => router.push('/card/add')}
          />
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsRow
            icon="dollar-sign"
            label="Currency"
            value={currency}
            onPress={() => {}}
          />
          {Platform.OS === 'android' && (
            <SettingsRow
              icon="message-square"
              label="SMS Auto-Import"
              trailing={
                <Switch
                  value={smsAutoImport}
                  onValueChange={(v) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSmsAutoImport(v);
                  }}
                  trackColor={{ false: colors.surfaceAlt, true: colors.purple }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          )}
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => {}}
          />
        </View>

        {/* Data section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingsRow
            icon="download"
            label="Export as CSV"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
          <SettingsRow
            icon="trash-2"
            label="Clear All Data"
            onPress={handleClearData}
          />
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsRow icon="info" label="Version" value="1.0.0" />
          <SettingsRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    gap: 24,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  section: {
    gap: 2,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSec,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.base,
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  profileEmail: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSec,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.purpleMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 1,
  },
  rowLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rowValue: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSec,
  },
});
