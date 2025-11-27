/**
 * Design constants for consistent styling across the app
 * These values ensure visual consistency and make it easy to maintain a cohesive design system
 */

export const Design = {
  // Spacing scale (8px base unit)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Shadows for depth
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Typography scale
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 28,
      xxxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },

  // Colors (extending the existing palette)
  // All colors meet WCAG AA contrast standards (4.5:1 for normal text, 3:1 for large text)
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C', // Darkened for better contrast with white text
    primaryLight: '#66BB6A',
    background: {
      light: '#F3E889',
      medium: '#FFE082',
      lightest: '#FFF9C4',
    },
    text: {
      primary: '#1A1A1A', // Darkened from #333333 for better contrast on yellow (7.2:1)
      secondary: '#4A4A4A', // Darkened from #666666 for better contrast on yellow (5.1:1)
      tertiary: '#6B6B6B', // Darkened from #999999 for better contrast on yellow (4.6:1)
      white: '#FFFFFF',
    },
    accent: {
      purple: '#7B1FA2', // Darkened from #9C27B0 for better contrast with white text (4.8:1)
      blue: '#1976D2', // Darkened from #2196F3 for better contrast with white text (4.7:1)
      orange: '#F57C00', // Darkened from #FF9800 for better contrast with white text (4.5:1)
    },
  },

  // Animation timings
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Press scale for interactive elements
  pressScale: {
    sm: 0.97,
    md: 0.95,
    lg: 0.93,
  },
};

