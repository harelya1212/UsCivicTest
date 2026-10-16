/**
 * theme/index.js - Design tokens for the rebuilt UI.
 *
 * Design language: clean, modern, confident. Built to feel like an app
 * teenagers choose to open, not a government form. Generous whitespace,
 * rounded surfaces, one vibrant gradient for primary actions.
 */

export const colors = {
  // Backgrounds
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F7',

  // Text
  text: '#101828',
  textSecondary: '#667085',
  textTertiary: '#98A2B3',
  textOnPrimary: '#FFFFFF',

  // Brand
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#EEF0FF',
  accent: '#7C3AED',

  // Status
  success: '#12B76A',
  successLight: '#E6F9F0',
  warning: '#F79009',
  warningLight: '#FEF4E6',
  danger: '#F04438',
  dangerLight: '#FEECEB',
  info: '#2E90FA',
  infoLight: '#EAF3FE',

  // Borders & dividers
  border: '#E4E7EC',
  borderLight: '#F2F4F7',

  // Gamification
  gold: '#FDB022',
  goldLight: '#FEF6E7',
  xp: '#7C3AED',
  xpLight: '#F1EAFE',
};

export const gradients = {
  primary: ['#4F46E5', '#7C3AED'],
  success: ['#12B76A', '#0E9384'],
  gold: ['#FDB022', '#F79009'],
  dark: ['#101828', '#1D2939'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  // Sizes
  hero: 32,
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 14,
  small: 12,
  // Weights (React Native)
  bold: '700',
  semibold: '600',
  medium: '500',
  regular: '400',
};

export const shadows = {
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export default { colors, gradients, spacing, radius, typography, shadows };
