// typography.ts - Urbanist font family type system
import { colors } from './colors';

export const fontFamily = {
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semiBold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
} as const;

export const typography = {
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  // Body
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bodyMd: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSec,
  },

  // Balance / Money display
  balanceLg: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  balanceMd: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
  },

  // Label
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSec,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Tab / Nav
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
} as const;
