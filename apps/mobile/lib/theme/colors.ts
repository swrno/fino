// colors.ts - single source of truth for all colors
export const colors = {
  // Backgrounds
  bg: '#0C0C0C',
  surface: '#181818',
  surfaceAlt: '#242424',
  overlay: '#2A2A2A',

  // Brand
  purple: '#6578C8',
  purpleMuted: '#6578C830',

  // Text
  textPrimary: '#FFFFFF',
  textSec: '#A0A0A0',
  textMuted: '#4D4D4D',
  textDark: '#242424',

  // Semantic
  positive: '#4CAF82',
  negative: '#E05C5C',
  warning: '#E0A45C',

  // Card gradient (holographic aurora)
  cardGradStart: '#8B5CF6',
  cardGradMid: '#3B82F6',
  cardGradEnd: '#06B6D4',
  cardGradOrange: '#F97316',
  cardGradPink: '#EC4899',

  // Bottom nav
  navBg: '#141414',
  navBorder: '#242424',
} as const;

export type ColorKey = keyof typeof colors;
