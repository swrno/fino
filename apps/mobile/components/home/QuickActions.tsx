// QuickActions.tsx - Send / Receive / Top Up button row
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';

interface QuickAction {
  label: string;
  icon: string;
  variant: 'default' | 'primary';
  onPress?: () => void;
}

const actions: QuickAction[] = [
  { label: 'Send', icon: 'arrow-up-right', variant: 'default' },
  { label: 'Receive', icon: 'arrow-down-left', variant: 'default' },
  { label: 'Top Up', icon: 'plus', variant: 'primary' },
];

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          style={({ pressed }) => [
            styles.button,
            action.variant === 'primary' ? styles.primaryButton : styles.defaultButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction?.(action.label);
          }}
        >
          <Feather
            name={action.icon as any}
            size={20}
            color={action.variant === 'primary' ? colors.textDark : colors.textPrimary}
          />
          <Text
            style={[
              styles.label,
              action.variant === 'primary' ? styles.primaryLabel : styles.defaultLabel,
            ]}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  defaultButton: {
    backgroundColor: colors.surfaceAlt,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  defaultLabel: {
    color: colors.textPrimary,
  },
  primaryLabel: {
    color: colors.textDark,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
