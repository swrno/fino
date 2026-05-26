// AuroraBlob.tsx - Decorative gradient blob for onboarding
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AuroraBlob() {
  return (
    <View style={styles.container}>
      {/* Main gradient blob */}
      <LinearGradient
        colors={[colors.cardGradStart, colors.cardGradMid, colors.cardGradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blob}
      />
      {/* Secondary pink/orange glow */}
      <LinearGradient
        colors={[colors.cardGradOrange, colors.cardGradPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blobSecondary}
      />
      {/* Darkening vignette overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(12,12,12,0.6)', colors.bg]}
        locations={[0, 0.6, 1]}
        style={styles.vignette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_WIDTH * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    opacity: 0.5,
    top: '10%',
    left: '15%',
  },
  blobSecondary: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.45,
    height: SCREEN_WIDTH * 0.45,
    borderRadius: SCREEN_WIDTH * 0.225,
    opacity: 0.35,
    top: '25%',
    right: '10%',
  },
  vignette: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
});
