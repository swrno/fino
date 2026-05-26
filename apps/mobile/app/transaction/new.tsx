// app/transaction/new.tsx - Add new transaction
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { Button } from '../../components/ui/Button';
import { SegmentControl } from '../../components/ui/SegmentControl';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { useTransactionStore } from '../../lib/store/useTransactionStore';
import { useCardStore } from '../../lib/store/useCardStore';
import { categoryNames } from '../../lib/theme/categories';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function NewTransactionScreen() {
  const router = useRouter();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const selectedCard = useCardStore((s) => s.getSelectedCard());

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [type, setType] = useState('Expense');
  const [note, setNote] = useState('');
  const [name, setName] = useState('');

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await addTransaction({
      id: generateId(),
      card_id: selectedCard?.id ?? null,
      name: name.trim() || category,
      amount: numAmount,
      type: type === 'Expense' ? 'debit' : 'credit',
      category,
      description: note.trim() || null,
      date: new Date().toISOString(),
      source: 'manual',
      raw_sms: null,
    });

    router.back();
  };

  // Keypad press handler
  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'delete') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === '.' && amount.includes('.')) {
      return; // prevent double decimal
    } else {
      // Max 2 decimal places
      const parts = amount.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      setAmount((prev) => prev + key);
    }
  };

  const displayAmount = amount || '0';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount display */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.amountDisplay}>{displayAmount}</Text>
        </View>

        {/* Type toggle */}
        <SegmentControl
          options={['Expense', 'Income']}
          value={type}
          onChange={setType}
        />

        {/* Merchant name */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.nameInput}
            placeholder="Merchant / Description"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            selectionColor={colors.purple}
          />
        </View>

        {/* Category chips */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
          >
            {categoryNames.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  cat === category && styles.categoryChipSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat);
                }}
              >
                <CategoryIcon category={cat} size={20} />
                <Text
                  style={[
                    styles.categoryChipText,
                    cat === category && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Note */}
        <TextInput
          style={styles.noteInput}
          placeholder="Add a note..."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          selectionColor={colors.purple}
        />

        {/* Card info */}
        {selectedCard && (
          <View style={styles.cardInfo}>
            <Feather name="credit-card" size={16} color={colors.textSec} />
            <Text style={styles.cardInfoText}>
              {selectedCard.name} •••• {selectedCard.last4}
            </Text>
          </View>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['.', '0', 'delete'],
          ].map((row, i) => (
            <View key={i} style={styles.keypadRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.keypadKey,
                    pressed && styles.keypadKeyPressed,
                  ]}
                  onPress={() => handleKeyPress(key)}
                >
                  {key === 'delete' ? (
                    <Feather name="delete" size={22} color={colors.textPrimary} />
                  ) : (
                    <Text style={styles.keypadText}>{key}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <Button
          label="Save Transaction"
          onPress={handleSave}
          disabled={!amount || parseFloat(amount) <= 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  closeBtn: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: spacing.base,
    gap: 16,
    paddingBottom: 20,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  currencySymbol: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: colors.textSec,
    marginTop: 8,
  },
  amountDisplay: {
    fontFamily: fontFamily.bold,
    fontSize: 48,
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  inputSection: {
    gap: 8,
  },
  nameInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  categorySection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSec,
    letterSpacing: 0.5,
  },
  categoryChips: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
  },
  categoryChipSelected: {
    backgroundColor: colors.purple,
  },
  categoryChipText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSec,
  },
  categoryChipTextSelected: {
    color: colors.textPrimary,
  },
  noteInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  cardInfoText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSec,
  },
  keypad: {
    gap: 8,
    paddingTop: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadKey: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  keypadText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
  },
});
