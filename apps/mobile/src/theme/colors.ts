/**
 * Color palette for the app
 */

export const colors = {
  // Primary
  primary: '#f97316', // Orange-500
  primaryDark: '#ea580c', // Orange-600
  primaryLight: '#fb923c', // Orange-400

  // Secondary
  secondary: '#8b5cf6', // Violet-500
  secondaryDark: '#7c3aed', // Violet-600
  secondaryLight: '#a78bfa', // Violet-400

  // Neutral
  black: '#000000',
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic
  success: '#10b981', // Green-500
  successLight: '#d1fae5', // Green-100
  error: '#ef4444', // Red-500
  errorLight: '#fee2e2', // Red-100
  warning: '#f59e0b', // Amber-500
  warningLight: '#fef3c7', // Amber-100
  info: '#3b82f6', // Blue-500
  infoLight: '#dbeafe', // Blue-100

  // Background
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',

  // Text
  text: {
    primary: '#111827', // Gray-900
    secondary: '#4b5563', // Gray-600
    tertiary: '#9ca3af', // Gray-400
    inverse: '#ffffff',
  },

  // Border
  border: '#e5e7eb', // Gray-200
  borderDark: '#d1d5db', // Gray-300

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export type Colors = typeof colors;






