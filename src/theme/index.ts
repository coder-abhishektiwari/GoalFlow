/**
 * GoalFlow Design System
 * Purple primary + Teal success — Dark flat theme
 */

import { useColorScheme } from 'react-native';

export const darkColors = {
  primary: '#534AB7',
  primaryLight: '#7B73D1',
  primaryDark: '#3D3490',
  primaryFaded: 'rgba(83, 74, 183, 0.15)',

  success: '#2ECDA7',
  successFaded: 'rgba(46, 205, 167, 0.15)',

  danger: '#FF6B6B',
  dangerFaded: 'rgba(255, 107, 107, 0.15)',

  warning: '#FFD93D',
  warningFaded: 'rgba(255, 217, 61, 0.15)',

  info: '#6EC1E4',

  background: '#0F0E1A',
  surface: '#1A1928',
  card: '#242336',
  cardLight: '#2D2C44',
  border: '#333254',

  text: '#FFFFFF',
  textSecondary: '#9B99B3',
  textMuted: '#6B6985',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const lightColors = {
  primary: '#534AB7', // Brand color remains the same
  primaryLight: '#7B73D1',
  primaryDark: '#3D3490',
  primaryFaded: 'rgba(83, 74, 183, 0.1)', // Slightly lighter fade for light mode

  success: '#10B981', // Slightly darker green for contrast in light mode
  successFaded: 'rgba(16, 185, 129, 0.15)',

  danger: '#EF4444',
  dangerFaded: 'rgba(239, 68, 68, 0.15)',

  warning: '#F59E0B',
  warningFaded: 'rgba(245, 158, 11, 0.15)',

  info: '#3B82F6',

  background: '#F9FAFB', // Light gray background
  surface: '#FFFFFF', // Pure white surface
  card: '#FFFFFF', // Pure white card
  cardLight: '#F3F4F6', // Slightly gray card variant
  border: '#E5E7EB', // Light borders

  text: '#111827', // Almost black text
  textSecondary: '#4B5563', // Gray text
  textMuted: '#9CA3AF', // Lighter gray text

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Fallback for static elements (defaults to dark to avoid breaking anywhere not migrated)
export const Colors = darkColors;

// Adaptive hook
export const useThemeColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Categories = [
  { id: 'health', label: 'Health', emoji: '💪', color: '#2ECDA7' },
  { id: 'career', label: 'Career', emoji: '💼', color: '#6EC1E4' },
  { id: 'learning', label: 'Learning', emoji: '📚', color: '#FFD93D' },
  { id: 'finance', label: 'Finance', emoji: '💰', color: '#FF9F43' },
  { id: 'personal', label: 'Personal', emoji: '🧘', color: '#A78BFA' },
  { id: 'other', label: 'Other', emoji: '✨', color: '#F472B6' },
] as const;

export type CategoryId = (typeof Categories)[number]['id'];
