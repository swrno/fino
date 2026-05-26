// app/card/[id].tsx - Card detail screen
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { Badge } from '../../components/ui/Badge';
import { TransactionItem } from '../../components/home/TransactionItem';
import { useCardStore } from '../../lib/store/useCardStore';
import { useTransactionStore } from '../../lib/store/useTransactionStore';
import { formatAmount } from '../../lib/utils/currency';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cards = useCardStore((s) => s.cards);
  const transactions = useTransactionStore((s) => s.transactions);

  const card = cards.find((c) => c.id === id);
  const cardTxs = transactions.filter((t) => t.card_id === id);

  if (!card) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Card not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Card header */}
      <LinearGradient
        colors={[card.color_start, card.color_end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.cardInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{card.name}</Text>
              <Badge
                label={card.type.toUpperCase()}
                variant="auto"
              />
            </View>
            <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balance}>₹{formatAmount(card.balance)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Transaction history */}
      <View style={styles.txSection}>
        <Text style={styles.txTitle}>Transaction History</Text>
        <Text style={styles.txCount}>{cardTxs.length} transactions</Text>
      </View>

      <FlatList
        data={cardTxs}
        renderItem={({ item, index }) => (
          <TransactionItem transaction={item} index={index} animated={false} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="credit-card" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No transactions on this card</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.textSec,
  },
  cardHeader: {
    height: 220,
    overflow: 'hidden',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: {
    flex: 1,
    padding: spacing.xl,
  },
  backBtn: {
    padding: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 4,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  cardNumber: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginTop: 4,
  },
  balanceLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
  balance: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  txSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  txTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  txCount: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSec,
  },
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
    gap: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
});
