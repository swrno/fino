// TransactionList.tsx - Recent transactions section
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { spacing } from '../../lib/theme/spacing';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from '../../lib/types';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showViewAll?: boolean;
  limit?: number;
}

export function TransactionList({
  transactions,
  title = 'Recent Transactions',
  showViewAll = true,
  limit = 5,
}: TransactionListProps) {
  const router = useRouter();
  const displayTxs = limit > 0 ? transactions.slice(0, limit) : transactions;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll && (
          <Pressable onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.list}>
        {displayTxs.length > 0 ? (
          displayTxs.map((tx, index) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              index={index}
              animated={true}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first transaction or enable SMS auto-import
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  viewAll: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.purple,
  },
  list: {
    gap: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textSec,
  },
  emptySubtext: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
