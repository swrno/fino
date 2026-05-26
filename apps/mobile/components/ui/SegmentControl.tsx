// SegmentControl.tsx - Pill toggle selector
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius } from '../../lib/theme/spacing';

interface SegmentControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentControl({ options, value, onChange }: SegmentControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => {
              if (!isActive) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(option);
              }
            }}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    padding: 4,
    height: 40,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl - 4,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSec,
  },
  labelActive: {
    color: colors.textDark,
  },
});
