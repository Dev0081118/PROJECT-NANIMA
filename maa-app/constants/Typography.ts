/**
 * Maa Design System — Apple Typography & Spacing System
 *
 * Designed for authentic Gujarati script legibility and iOS design harmony:
 * - Clean San Francisco system font scaling
 * - Balanced Gujarati line heights for ligatures and vowels
 * - Subtle neutral shadows and precise 8-point spatial grid
 */
export const Typography = {
  // Font families
  fontFamily: {
    sans: 'System',          // System default (San Francisco / Noto Sans Gujarati)
    serif: 'Georgia',
    mono: 'Courier',
  },

  // Font sizes (iOS scale)
  fontSize: {
    xs: 11,                  // Caption 2
    sm: 13,                  // Footnote
    base: 15,                // Subhead
    md: 17,                  // Body / Headline
    lg: 20,                  // Title 3
    xl: 22,                  // Title 2
    '2xl': 28,               // Title 1
    '3xl': 34,               // Large Title
    '4xl': 40,               // Display
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.45,
    relaxed: 1.65,           // Optimal for Gujarati script diacritics
    loose: 1.85,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 44,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};
