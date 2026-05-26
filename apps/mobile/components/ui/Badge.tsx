// Badge.tsx - Small pill badge component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';

type BadgeVariant = 'auto' | 'manual' | 'expense' | 'income' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  auto: { bg: colors.purpleMuted, text: colors.purple },
  manual: { bg: colors.surfaceAlt, text: colors.textSec },
  expense: { bg: '#E05C5C20', text: colors.negative },
  income: { bg: '#4CAF8220', text: colors.positive },
  default: { bg: colors.surfaceAlt, text: colors.textSec },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { bg, text } = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
  },
});
