
// Comprehensive design tokens for the universal design system
export const designTokens = {
  // Color System - Based on PSD Analysis dark theme
  colors: {
    // Background Colors
    background: {
      primary: '#0a0a0b',      // Darkest background
      secondary: '#131316',    // Card backgrounds
      tertiary: '#1a1f2e',     // Panel backgrounds
      hover: '#242428',        // Hover states
    },
    // Border Colors
    border: {
      primary: '#334155',      // Subtle borders (slate-700)
      secondary: '#475569',    // Medium borders (slate-600)
      accent: '#4ade80',       // Green accent borders
    },
    // Text Colors
    text: {
      primary: '#ffffff',      // White text
      secondary: '#e2e8f0',    // Light gray text
      tertiary: '#94a3b8',     // Medium gray text
      muted: '#64748b',        // Muted text
    },
    // Brand Colors
    brand: {
      primary: '#4ade80',      // CRD Green
      secondary: '#22c55e',    // Green secondary
      accent: '#16a34a',       // Green accent
    },
    // Status Colors
    status: {
      success: '#10b981',      // Success green
      warning: '#f59e0b',      // Warning amber
      error: '#ef4444',        // Error red
      info: '#3b82f6',         // Info blue
    }
  },
  
  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '2rem',     // 32px
      '4xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },
  
  // Spacing System (4px/8px grid)
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
} as const;

export type DesignTokens = typeof designTokens;
