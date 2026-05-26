// ProgressDots.tsx - Onboarding progress indicator
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme/colors';

interface ProgressDotsProps {
  total: number;
  current: number;
}

function Dot({ active }: { active: boolean }) {
  const widthAnim = useRef(new Animated.Value(active ? 24 : 8)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: active ? 24 : 8,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [active, widthAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: widthAnim,
          backgroundColor: active ? colors.purple : colors.overlay,
        },
      ]}
    />
  );
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
