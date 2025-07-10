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

        // === Cardshow v1.0 Brand Colors ===
        'cs-brand': {
          orange: 'hsl(var(--cs-brand-orange))',
          green: 'hsl(var(--cs-brand-green))',
          blue: 'hsl(var(--cs-brand-blue))',
          purple: 'hsl(var(--cs-brand-purple))',
          gold: 'hsl(var(--cs-brand-gold))',
        },

        // === Cardshow Neutral Palette ===
        'cs-neutral': {
          1: 'hsl(var(--cs-neutral-1))',
          2: 'hsl(var(--cs-neutral-2))',
          3: 'hsl(var(--cs-neutral-3))',
          4: 'hsl(var(--cs-neutral-4))',
          5: 'hsl(var(--cs-neutral-5))',
          6: 'hsl(var(--cs-neutral-6))',
          7: 'hsl(var(--cs-neutral-7))',
          8: 'hsl(var(--cs-neutral-8))',
          9: 'hsl(var(--cs-neutral-9))',
        },

        // === Cardshow Accent Colors ===
        'cs-accent': {
          red: 'hsl(var(--cs-accent-red))',
          yellow: 'hsl(var(--cs-accent-yellow))',
          cyan: 'hsl(var(--cs-accent-cyan))',
          emerald: 'hsl(var(--cs-accent-emerald))',
        },

        // === Legacy CRD Support ===
        'crd-orange': 'hsl(var(--crd-orange))',
        'crd-green': 'hsl(var(--crd-green))',
        'crd-blue': 'hsl(var(--crd-blue))',
        'crd-purple': '#9757D7',
        'crd-white': '#FCFCFD',
        'crd-lightGray': '#777E90',
        'crd-mediumGray': '#353945',
        'crd-darkGray': '#23262F',
        'crd-dark': '#1A1A1A',
        'crd-darkest': '#121212',
        
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
        // Cardshow radius scale
        'cs-sm': 'var(--cs-radius-sm)',
        'cs-md': 'var(--cs-radius-md)',
        'cs-lg': 'var(--cs-radius-lg)',
        'cs-xl': 'var(--cs-radius-xl)',
        'cs-2xl': 'var(--cs-radius-2xl)',
      },
      spacing: {
        // Cardshow 8px grid spacing
        'cs-1': 'var(--cs-space-1)',
        'cs-2': 'var(--cs-space-2)',
        'cs-3': 'var(--cs-space-3)',
        'cs-4': 'var(--cs-space-4)',
        'cs-6': 'var(--cs-space-6)',
        'cs-8': 'var(--cs-space-8)',
        'cs-12': 'var(--cs-space-12)',
        'cs-16': 'var(--cs-space-16)',
        'cs-20': 'var(--cs-space-20)',
        'cs-24': 'var(--cs-space-24)',
        'cs-32': 'var(--cs-space-32)',
      },
      fontSize: {
        // Cardshow typography scale
        'cs-xs': 'var(--cs-text-xs)',
        'cs-sm': 'var(--cs-text-sm)',
        'cs-base': 'var(--cs-text-base)',
        'cs-lg': 'var(--cs-text-lg)',
        'cs-xl': 'var(--cs-text-xl)',
        'cs-2xl': 'var(--cs-text-2xl)',
        'cs-3xl': 'var(--cs-text-3xl)',
        'cs-4xl': 'var(--cs-text-4xl)',
        'cs-5xl': 'var(--cs-text-5xl)',
      },
      boxShadow: {
        // Cardshow shadow scale
        'cs-sm': 'var(--cs-shadow-sm)',
        'cs-md': 'var(--cs-shadow-md)',
        'cs-lg': 'var(--cs-shadow-lg)',
        'cs-xl': 'var(--cs-shadow-xl)',
        'cs-glow': 'var(--cs-shadow-glow)',
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
        // Cardshow animations
        "cardshow-fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "cardshow-scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cardshow-fade-in": "cardshow-fade-in 0.3s ease-out",
        "cardshow-scale-in": "cardshow-scale-in 0.2s ease-out",
      },
      fontFamily: {
        // Cardshow typography stack
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
        'heading': ['Raleway', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
        // Legacy fonts
        'orbitron': ['Orbitron', 'monospace'],
        'dancing': ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
