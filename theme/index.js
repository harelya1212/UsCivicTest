/**
 * theme/index.js - Design tokens for the rebuilt UI.
 *
 * Design language: American achievement. Deep navy for trust and
 * authority, gold for celebration and progress, warm red for energy.
 * Built to feel like an app people choose to open, not a government
 * form. Generous whitespace, rounded surfaces, one confident gradient
 * for primary actions. Rounded Nunito type for a friendly, Duolingo-like
 * voice that stays highly readable for non-native English speakers.
 */

export const colors = {
  // Backgrounds - warm paper tones, softer than blue-white for long sessions
  background: '#F9F6F1',
  surface: '#FFFFFF',
  surfaceAlt: '#F1ECE4',

  // Text
  text: '#101828',
  textSecondary: '#667085',
  textTertiary: '#98A2B3',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // Brand - navy / gold / warm red
  primary: '#1B2A4A',
  primaryDark: '#121E35',
  primaryLight: '#EDE8DE',
  accent: '#F5B301',
  accentDark: '#D99A00',
  accentLight: '#FEF6E0',

  // Status
  success: '#12B76A',
  successLight: '#E6F9F0',
  warning: '#F79009',
  warningLight: '#FEF4E6',
  danger: '#E63946',
  dangerLight: '#FDECEC',
  info: '#2E90FA',
  infoLight: '#EAF3FE',

  // Borders & dividers
  border: '#E5DDD0',
  borderLight: '#F2EEE6',

  // Gamification
  gold: '#F5B301',
  goldLight: '#FEF6E0',
  xp: '#F5B301',
  xpLight: '#FEF6E0',
};

export const gradients = {
  primary: ['#1B2A4A', '#2A4365'],
  hero: ['#1B2A4A', '#1B2A4A'],
  gold: ['#F5B301', '#F79009'],
  success: ['#12B76A', '#0E9384'],
  danger: ['#E63946', '#B42318'],
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
  // Font families (Nunito, loaded via @expo-google-fonts/nunito;
  // falls back to system font if not yet loaded)
  fontRegular: 'Nunito_400Regular',
  fontMedium: 'Nunito_600SemiBold',
  fontBold: 'Nunito_700Bold',
  fontExtraBold: 'Nunito_800ExtraBold',
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
