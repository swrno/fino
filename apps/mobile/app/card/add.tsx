// app/card/add.tsx - Add a new card
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SegmentControl } from '../../components/ui/SegmentControl';
import { useCardStore } from '../../lib/store/useCardStore';

const GRADIENT_PRESETS = [
  { start: '#8B5CF6', end: '#06B6D4', label: 'Aurora' },
  { start: '#F97316', end: '#EC4899', label: 'Sunset' },
  { start: '#10B981', end: '#3B82F6', label: 'Ocean' },
  { start: '#E05C5C', end: '#F59E0B', label: 'Flame' },
  { start: '#6578C8', end: '#7C3AED', label: 'Indigo' },
];

function generateId(): string {
  return 'card-' + Math.random().toString(36).slice(2, 10);
}

export default function AddCardScreen() {
  const router = useRouter();
  const addCard = useCardStore((s) => s.addCard);

  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState('debit');
  const [selectedGradient, setSelectedGradient] = useState(0);

  const preset = GRADIENT_PRESETS[selectedGradient];

  const handleSave = async () => {
    if (!name.trim() || !last4.trim() || last4.length !== 4) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await addCard({
      id: generateId(),
      name: name.trim(),
      last4,
      type: type as 'credit' | 'debit' | 'wallet',
      bank: bank.trim() || null,
      color_start: preset.start,
      color_end: preset.end,
      balance: 0,
      is_active: true,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview */}
        <LinearGradient
          colors={[preset.start, preset.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardPreview}
        >
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>
            <Text style={styles.cardNamePreview}>
              {name || 'Card Name'}
            </Text>
            <Text style={styles.cardLast4Preview}>
              •••• {last4 || '0000'}
            </Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <Input
          label="Card Name"
          placeholder="e.g., HDFC Platinum"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Last 4 Digits"
          placeholder="1234"
          value={last4}
          onChangeText={(t) => setLast4(t.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          maxLength={4}
        />

        <Input
          label="Bank Name"
          placeholder="e.g., HDFC Bank"
          value={bank}
          onChangeText={setBank}
        />

        {/* Card type */}
        <View style={styles.typeSection}>
          <Text style={styles.sectionLabel}>Card Type</Text>
          <SegmentControl
            options={['Debit', 'Credit', 'Wallet']}
            value={type.charAt(0).toUpperCase() + type.slice(1)}
            onChange={(v) => setType(v.toLowerCase())}
          />
        </View>

        {/* Color picker */}
        <View style={styles.colorSection}>
          <Text style={styles.sectionLabel}>Card Style</Text>
          <View style={styles.colorRow}>
            {GRADIENT_PRESETS.map((g, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedGradient(i);
                }}
                style={[
                  styles.colorOption,
                  i === selectedGradient && styles.colorOptionSelected,
                ]}
              >
                <LinearGradient
                  colors={[g.start, g.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.colorSwatch}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save */}
      <View style={styles.footer}>
        <Button
          label="Add Card"
          onPress={handleSave}
          disabled={!name.trim() || last4.length !== 4}
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
    paddingBottom: 100,
  },
  cardPreview: {
    height: 160,
    borderRadius: radius.xxl - 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    gap: 4,
  },
  cardNamePreview: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  cardLast4Preview: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  typeSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSec,
    letterSpacing: 0.5,
  },
  colorSection: {
    gap: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorOption: {
    borderRadius: 14,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.purple,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
  },
});
