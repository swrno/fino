// app/transaction/[id].tsx - Transaction detail / edit screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { useTransactionStore } from '../../lib/store/useTransactionStore';
import { formatAmount } from '../../lib/utils/currency';
import { formatFullDate, formatTime } from '../../lib/utils/date';
import { categoryNames } from '../../lib/theme/categories';
import type { Transaction } from '../../lib/types';

function DetailField({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.field}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldValue}>{value}</Text>
        {icon && <Feather name={icon as any} size={16} color={colors.textMuted} />}
      </View>
    </Pressable>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const transactions = useTransactionStore((s) => s.transactions);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  const tx = transactions.find((t) => t.id === id);
  const [description, setDescription] = useState(tx?.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState(tx?.category ?? 'Other');
  const [showCategories, setShowCategories] = useState(false);

  if (!tx) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Transaction not found</Text>
          <Button label="Go Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateTransaction(tx.id, {
      description,
      category: selectedCategory,
    });
    router.back();
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteTransaction(tx.id);
    router.back();
  };

  const amountColor = tx.type === 'debit' ? colors.negative : colors.positive;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.cardGradStart, colors.cardGradMid, colors.cardGradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.gradientOverlay} />
        <View style={styles.gradientContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.amountLarge}>
            {tx.type === 'debit' ? '-' : '+'}₹{formatAmount(tx.amount)}
          </Text>
          <Text style={styles.merchantName}>{tx.name}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Source badge */}
        <View style={styles.badgeRow}>
          <Badge
            label={tx.source === 'sms' ? 'Auto-detected' : 'Manual'}
            variant={tx.source === 'sms' ? 'auto' : 'manual'}
          />
          <Badge
            label={tx.type === 'debit' ? 'Expense' : 'Income'}
            variant={tx.type === 'debit' ? 'expense' : 'income'}
          />
        </View>

        {/* Category */}
        <Pressable
          style={styles.field}
          onPress={() => setShowCategories(!showCategories)}
        >
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.fieldRow}>
            <CategoryIcon category={selectedCategory} size={24} />
            <Text style={styles.fieldValue}>{selectedCategory}</Text>
            <Feather name="chevron-down" size={16} color={colors.textMuted} />
          </View>
        </Pressable>

        {showCategories && (
          <View style={styles.categoryPicker}>
            {categoryNames.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryOption,
                  cat === selectedCategory && styles.categoryOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(cat);
                  setShowCategories(false);
                }}
              >
                <CategoryIcon category={cat} size={28} />
                <Text
                  style={[
                    styles.categoryOptionText,
                    cat === selectedCategory && styles.categoryOptionTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Date */}
        <DetailField
          label="Date"
          value={formatFullDate(tx.date)}
        />

        <DetailField
          label="Time"
          value={formatTime(tx.date)}
        />

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            selectionColor={colors.purple}
          />
        </View>

        {/* Raw SMS */}
        {tx.raw_sms && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Original SMS</Text>
            <Text style={styles.rawSms}>{tx.raw_sms}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={20} color={colors.negative} />
        </Pressable>
        <View style={styles.saveBtnContainer}>
          <Button label="Save Changes" onPress={handleSave} />
        </View>
      </View>
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
    gap: 16,
  },
  notFoundText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.textSec,
  },
  gradient: {
    height: 180,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradientContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    gap: 4,
  },
  backBtn: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    padding: 8,
    zIndex: 1,
  },
  amountLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  merchantName: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.base,
    gap: 12,
    paddingBottom: 100,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSec,
    letterSpacing: 0.5,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldValue: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rawSms: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSec,
    lineHeight: 18,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  categoryOptionActive: {
    backgroundColor: colors.purpleMuted,
  },
  categoryOptionText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSec,
  },
  categoryOptionTextActive: {
    color: colors.purple,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    backgroundColor: colors.bg,
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E05C5C15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnContainer: {
    flex: 1,
  },
});
