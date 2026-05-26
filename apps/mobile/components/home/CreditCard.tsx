// CreditCard.tsx - Holographic gradient card with shimmer animation
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { formatAmount } from '../../lib/utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 200;

interface CreditCardProps {
  name: string;
  last4: string;
  balance: number;
  colorStart?: string;
  colorEnd?: string;
  isActive?: boolean;
  onToggleActive?: () => void;
}

export function CreditCard({
  name,
  last4,
  balance,
  colorStart = colors.cardGradStart,
  colorEnd = colors.cardGradEnd,
  isActive = true,
}: CreditCardProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colorStart, colors.cardGradMid, colorEnd, colors.cardGradOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Dark overlay for readability */}
        <View style={styles.overlay} />

        {/* Shimmer effect */}
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.15)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Card content */}
        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{name} •••• {last4}</Text>
              <Feather name="chevron-down" size={16} color="rgba(255,255,255,0.7)" />
            </View>
            <View style={[styles.statusDot, { backgroundColor: isActive ? colors.positive : colors.textMuted }]} />
          </View>

          {/* Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <Text style={styles.balance}>
              {balanceVisible ? `₹${formatAmount(balance)}` : '₹ ••••••'}
            </Text>
          </View>

          {/* Eye toggle */}
          <Pressable
            style={styles.eyeButton}
            onPress={() => setBalanceVisible(!balanceVisible)}
          >
            <Feather
              name={balanceVisible ? 'eye' : 'eye-off'}
              size={18}
              color="rgba(255,255,255,0.6)"
            />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.xxl - 4,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.xxl - 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardName: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceSection: {
    gap: 4,
  },
  balanceLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  balance: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    padding: 4,
    zIndex: 2,
  },
});
