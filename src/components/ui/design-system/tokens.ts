
// Comprehensive design tokens for the universal design system - Updated from screenshots
export const designTokens = {
  // Color System - Based on actual implemented interface
  colors: {
    // Background Colors - Extracted from screenshots
    background: {
      primary: '#0a0a0b',      // Main app background
      secondary: '#131316',    // Card backgrounds
      tertiary: '#1a1f2e',     // Panel backgrounds
      hover: '#242428',        // Hover states
      modal: 'rgba(10, 10, 11, 0.95)', // Modal backdrop
    },
    // Border Colors - From actual UI
    border: {
      primary: '#334155',      // Subtle borders (slate-700)
      secondary: '#475569',    // Medium borders (slate-600)
      accent: '#4ade80',       // Green accent borders
      focus: '#4A90FF',        // Focus ring color
    },
    // Text Colors - From implemented interface
    text: {
      primary: '#ffffff',      // White text for headings
      secondary: '#e2e8f0',    // Light gray text
      tertiary: '#94a3b8',     // Medium gray text
      muted: '#64748b',        // Muted text
      accent: '#4ade80',       // Green accent text
      link: '#4A90FF',         // Blue for links
    },
    // Brand Colors - From navigation and UI elements
    brand: {
      primary: '#4ade80',      // CRD Green
      secondary: '#FF6B4A',    // CRD Orange
      tertiary: '#4A90FF',     // CRD Blue
      purple: '#9757D7',       // Premium purple
    },
    // Status Colors - From actual implementation
    status: {
      success: '#10b981',      // Success green
      warning: '#f59e0b',      // Warning amber
      error: '#ef4444',        // Error red
      info: '#3b82f6',         // Info blue
      online: '#22c55e',       // Online indicator
      verified: '#4ade80',     // Verified badge
    },
    // Marketplace Colors - From screenshots
    marketplace: {
      price: '#4ade80',        // Price text
      bid: '#f59e0b',          // Bid buttons
      auction: '#ef4444',      // Auction timers
      sold: '#6b7280',         // Sold overlay
      featured: '#9757D7',     // Featured badges
    }
  },
  
  // Typography System - Based on actual interface
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Monaco', 'Consolas', 'monospace'],
      display: ['Orbitron', 'monospace'], // For card names and titles
    },
    fontSize: {
      xs: '0.75rem',     // 12px - Small metadata
      sm: '0.875rem',    // 14px - Body text
      base: '1rem',      // 16px - Default
      lg: '1.125rem',    // 18px - Large body
      xl: '1.25rem',     // 20px - Card titles
      '2xl': '1.5rem',   // 24px - Section headers
      '3xl': '2rem',     // 32px - Page titles
      '4xl': '3rem',     // 48px - Hero text
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },
  
  // Spacing System - Based on consistent spacing in UI
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px - Base unit
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px - Large sections
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Layout System - From screenshots
  layout: {
    // Container widths
    container: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
    },
    // Grid systems
    grid: {
      cards: {
        mobile: 'repeat(2, 1fr)',
        tablet: 'repeat(3, 1fr)',
        desktop: 'repeat(4, 1fr)',
        wide: 'repeat(5, 1fr)',
      },
      gap: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      }
    },
    // Navigation
    nav: {
      height: '64px',
      padding: '0 24px',
    }
  },
  
  // Border Radius - From UI elements
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px - Cards
    lg: '0.75rem',    // 12px - Large cards
    xl: '1rem',       // 16px - Modals
    '2xl': '1.5rem',  // 24px - Hero sections
    full: '9999px',   // Pills and avatars
  },
  
  // Shadows - From actual interface depth
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    card: '0 4px 12px rgba(0, 0, 0, 0.3)', // Card hover
    cardHover: '0 12px 24px rgba(0, 0, 0, 0.4)', // Card lifted
    glow: '0 0 20px rgba(74, 222, 128, 0.4)', // Green glow
  },
  
  // Animation System - From interface interactions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    scale: {
      hover: '1.02',
      active: '0.98',
      card: '1.03',
    }
  },
  
  // Component Specifications - From screenshots
  components: {
    // Trading Cards
    card: {
      aspectRatio: '3/4',
      borderRadius: '12px',
      padding: '16px',
      hover: {
        transform: 'translateY(-4px) scale(1.03)',
        shadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
      }
    },
    // Navigation
    nav: {
      height: '64px',
      blur: 'blur(12px)',
      background: 'rgba(10, 10, 11, 0.8)',
      border: '1px solid #334155',
    },
    // Buttons
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '8px 16px',
        md: '12px 24px',
        lg: '16px 32px',
      }
    },
    // Profile Elements
    profile: {
      avatar: {
        sizes: {
          sm: '32px',
          md: '48px',
          lg: '96px',
          xl: '120px',
        }
      },
      banner: {
        height: '200px',
        borderRadius: '0 0 24px 24px',
      }
    }
  }
} as const;

export type DesignTokens = typeof designTokens;
