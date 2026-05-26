// PeriodPicker.tsx - Dropdown chip for selecting time period
import React, { useState } from 'react';
import { View, Pressable, Text, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import type { Period } from '../../lib/utils/date';

interface PeriodPickerProps {
  value: Period;
  onChange: (period: Period) => void;
}

const options: Period[] = ['week', 'month', 'year'];
const labels: Record<Period, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
      >
        <Text style={styles.chipText}>{labels[value]}</Text>
        <Feather name="chevron-down" size={14} color={colors.textPrimary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {options.map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.menuItem,
                  opt === value && styles.menuItemActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onChange(opt);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.menuText,
                    opt === value && styles.menuTextActive,
                  ]}
                >
                  {labels[opt]}
                </Text>
                {opt === value && (
                  <Feather name="check" size={16} color={colors.purple} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    width: 200,
    borderWidth: 1,
    borderColor: colors.navBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
  },
  menuItemActive: {
    backgroundColor: colors.purpleMuted,
  },
  menuText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textSec,
  },
  menuTextActive: {
    color: colors.purple,
  },
});
