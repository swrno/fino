// TransactionItem.tsx - Single transaction row
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { spacing } from '../../lib/theme/spacing';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { formatAmount } from '../../lib/utils/currency';
import { formatTransactionDate } from '../../lib/utils/date';
import type { Transaction } from '../../lib/types';

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
  animated?: boolean;
}

export function TransactionItem({
  transaction: tx,
  index = 0,
  animated = true,
}: TransactionItemProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;

  useEffect(() => {
    if (!animated) return;
    const delay = index * 50;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, fadeAnim, index, slideAnim]);

  const amountColor = tx.type === 'debit' ? colors.negative : colors.positive;
  const amountSign = tx.type === 'debit' ? '-' : '+';

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        onPress={() => router.push(`/transaction/${tx.id}`)}
      >
        <CategoryIcon category={tx.category} size={40} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {tx.name}
            </Text>
            {tx.source === 'sms' && <Badge label="Auto" variant="auto" />}
          </View>
          <Text style={styles.category}>{tx.category}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountSign}₹{formatAmount(tx.amount)}
          </Text>
          <Text style={styles.date}>{formatTransactionDate(tx.date)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  category: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
