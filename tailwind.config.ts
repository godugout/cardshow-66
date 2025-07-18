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
        // CRD Brand Colors - New Design System
        'crd-orange': 'hsl(var(--crd-orange))',
        'crd-green': 'hsl(var(--crd-green))',
        'crd-blue': 'hsl(var(--crd-blue))',
        
        // Legacy CRD colors (will be phased out)
        'crd-orange-legacy': '#EA6E48',
        'crd-blue-legacy': '#3772FF',
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
        'orbitron': ['Orbitron', 'monospace'],
        'dancing': ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
