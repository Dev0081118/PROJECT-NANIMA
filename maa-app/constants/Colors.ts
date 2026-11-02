/**
 * Maa Design System — Colours
 *
 * Palette inspired by warm terracotta and natural earth tones.
 * Deliberately avoids robotic blues, glowing AI aesthetics, and generic gradients.
 * The grandmother and her conversation are the focus.
 */
export const Colors = {
  // Primary palette — warm earthy terracotta
  primary: '#8B4513',          // Deep terracotta / sindoor
  primaryLight: '#C4643A',     // Lighter terracotta
  primaryVery: '#F2D5C0',      // Very light terracotta tint

  // Secondary — warm gold
  secondary: '#C49A2A',        // Warm gold / haldi
  secondaryLight: '#F0D98A',   // Light gold tint

  // Backgrounds
  background: '#FAF6F1',       // Warm off-white, like aged paper
  backgroundCard: '#F5EEE6',   // Slightly warmer card background
  backgroundModal: '#FFFFFF',

  // Text
  textPrimary: '#2C1810',      // Deep warm brown
  textSecondary: '#6B4423',    // Medium warm brown
  textMuted: '#9E7B5E',        // Muted warm brown
  textOnPrimary: '#FFFFFF',    // White on primary colour
  textOnDark: '#FAF6F1',

  // Status colours
  success: '#4A7C59',          // Forest green
  warning: '#C49A2A',          // Same as secondary
  error: '#A63228',            // Deep red
  info: '#4A6FA5',             // Muted blue

  // UI Elements
  border: '#E0C9B3',           // Warm light border
  borderFocus: '#8B4513',      // Primary on focus
  divider: '#EDD9C3',          // Subtle divider
  shadow: 'rgba(44, 24, 16, 0.12)',

  // Conversation states
  userBubble: '#E8DDD3',       // User message bubble
  assistantBubble: '#F5EEE6',  // Maa response bubble
  listeningIndicator: '#4A7C59',  // Green pulse when listening
  speakingIndicator: '#8B4513',   // Terracotta pulse when speaking

  // Verification badges
  verified: '#4A7C59',
  pending: '#C49A2A',
  rejected: '#A63228',
  uncertain: '#9E7B5E',

  // Transparent
  overlay: 'rgba(44, 24, 16, 0.5)',
  transparent: 'transparent',
};

export type ColorKey = keyof typeof Colors;
