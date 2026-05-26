// app/(tabs)/index.tsx - Home tab
import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { spacing } from '../../lib/theme/spacing';
import { CreditCard } from '../../components/home/CreditCard';
import { QuickActions } from '../../components/home/QuickActions';
import { TransactionList } from '../../components/home/TransactionList';
import { useTransactionStore } from '../../lib/store/useTransactionStore';
import { useCardStore } from '../../lib/store/useCardStore';
import { useSettingsStore } from '../../lib/store/useSettingsStore';

export default function HomeScreen() {
  const router = useRouter();
  const transactions = useTransactionStore((s) => s.transactions);
  const getRecentTransactions = useTransactionStore((s) => s.getRecentTransactions);
  const card = useCardStore((s) => s.getSelectedCard());
  const userName = useSettingsStore((s) => s.userName);

  const recentTxs = getRecentTransactions(5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <Pressable style={styles.bellButton}>
            <Feather name="bell" size={22} color={colors.textSec} />
          </Pressable>
        </View>

        {/* Credit Card */}
        {card && (
          <CreditCard
            name={card.name}
            last4={card.last4}
            balance={card.balance}
            colorStart={card.color_start}
            colorEnd={card.color_end}
            isActive={card.is_active}
          />
        )}

        {/* Quick Actions */}
        <QuickActions
          onAction={(action) => {
            if (action === 'Top Up') {
              router.push('/transaction/new');
            }
          }}
        />

        {/* Recent Transactions */}
        <TransactionList
          transactions={recentTxs}
          title="Recent Transactions"
          showViewAll={transactions.length > 5}
        />
      </ScrollView>

      {/* FAB for adding transaction */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push('/transaction/new')}
      >
        <Feather name="plus" size={24} color={colors.textPrimary} />
      </Pressable>
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
    gap: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  greeting: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  userName: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bellButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
