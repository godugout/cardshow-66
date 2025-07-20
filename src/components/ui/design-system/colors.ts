
// Centralized color system for type safety and consistency - Updated to match actual UI
export const colors = {
  // Brand colors - Updated to match Cardshow interface
  brand: {
    orange: '#FF6B4A',      // Primary CRD orange from navigation
    blue: '#4A90FF',        // Accent blue for buttons and highlights
    green: '#4ade80',       // Success green and primary actions
    greenSecondary: '#22c55e', // Secondary green shade
    greenAccent: '#16a34a', // Darker green accent
    purple: '#9757D7',      // Purple for premium features
    gold: '#FFD700',        // Gold for special items
  },
  // Interface colors - Extracted from screenshots
  interface: {
    background: '#0a0a0b',     // Main dark background
    cardBackground: '#131316',  // Card backgrounds
    panelBackground: '#1a1f2e', // Side panels and modals
    hoverBackground: '#242428', // Hover states
    borderPrimary: '#334155',   // Subtle borders
    borderSecondary: '#475569', // Medium borders
    borderAccent: '#4ade80',    // Green accent borders
  },
  // Text colors - From actual implementation
  text: {
    primary: '#ffffff',      // White text for headings
    secondary: '#e2e8f0',    // Light gray for body text
    tertiary: '#94a3b8',     // Medium gray for metadata
    muted: '#64748b',        // Muted text for placeholders
    accent: '#4ade80',       // Green for links and actions
  },
  // Status and interaction colors
  status: {
    success: '#10b981',      // Success green
    warning: '#f59e0b',      // Warning amber
    error: '#ef4444',        // Error red
    info: '#3b82f6',         // Info blue
    online: '#22c55e',       // Online status
    offline: '#6b7280',      // Offline status
  },
  // Marketplace specific colors
  marketplace: {
    price: '#4ade80',        // Price display green
    bid: '#f59e0b',          // Bid amount orange
    auction: '#ef4444',      // Auction red
    sold: '#6b7280',         // Sold items gray
    featured: '#9757D7',     // Featured items purple
  },
  // Legacy colors (will be phased out)
  neutral: {
    darkest: '#121212',
    dark: '#1A1A1A', 
    darkGray: '#23262F',
    mediumGray: '#353945',
    lightGray: '#777E90',
    white: '#FCFCFD',
  },
  // Editor specific
  editor: {
    dark: '#1a1a1a',
    darker: '#121212', 
    tool: '#2a2a2a',
    border: '#333333',
    canvas: '#2c2c2c',
  }
} as const;

export type ColorKey = keyof typeof colors;
export type BrandColor = keyof typeof colors.brand;
export type InterfaceColor = keyof typeof colors.interface;
export type TextColor = keyof typeof colors.text;
export type StatusColor = keyof typeof colors.status;
export type MarketplaceColor = keyof typeof colors.marketplace;
export type NeutralColor = keyof typeof colors.neutral;
