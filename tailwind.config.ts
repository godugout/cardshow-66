import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // CARDSHOW UNIFIED BRAND COLORS - EXACT SPECIFICATIONS
        'crd-black': '#1a1a1a',        // Primary background - premium dark
        'crd-surface': '#2d2d2d',      // Card surfaces and containers  
        'crd-surface-light': '#3d3d3d', // Elevated surfaces and hover states
        'crd-text': '#ffffff',         // Primary text - high contrast
        'crd-text-dim': '#a0a0a0',     // Secondary text and descriptions
        'crd-text-muted': '#707070',   // Disabled and tertiary text
        
        // Feature-Specific Brand Colors
        'crd-green': '#00C851',        // Collections, success states, growth
        'crd-orange': '#FF6D00',       // Cards, creation tools, creativity
        'crd-blue': '#2D9CDB',         // Marketplace, transactions, trust
        'crd-yellow': '#FFD700',       // CRD tokens, premium features, rewards
        
        // Interactive States
        'crd-hover': '#404040',        // Hover state for interactive elements
        'crd-active': '#4d4d4d',       // Active/pressed state
        'crd-focus': '#0066cc',        // Focus rings and accessibility
        'crd-border': '#404040',       // Borders and dividers
        'crd-border-light': '#606060', // Lighter borders for emphasis
        
        // Semantic Colors
        'crd-success': '#00C851',      // Success messages and confirmations
        'crd-warning': '#FFA726',      // Warnings and caution states
        'crd-error': '#F44336',        // Error states and destructive actions
        'crd-info': '#2D9CDB',         // Information and neutral states
        
        // Editor colors
        'editor-dark': '#1a1a1a',
        'editor-darker': '#121212',
        'editor-tool': '#2a2a2a',
        'editor-border': '#333333',
        'editor-canvas': '#2c2c2c',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        // CARDSHOW TYPOGRAPHY SYSTEM
        'ui': ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['Roboto Mono', 'Consolas', 'monospace'],
        'display': ['Orbitron', 'monospace'], // For card names and branded elements
        'script': ['Dancing Script', 'cursive'], // For decorative elements
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
