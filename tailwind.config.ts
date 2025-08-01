import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
          50: '#f0fdf4',
          100: '#dcfce7', 
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Forest Green - Growth & prosperity
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',  // Golden yellow - Energy & optimism
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Warm orange - Creativity & innovation
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
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
        neutral: {
          0: '#fefefe',
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',  // Forest green
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',  // Golden yellow
          600: '#ca8a04',
          700: '#a16207',
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
          900: "#7f1d1d",
        },
        // Organic Finance - Surface colors
        surface: {
          paper: '#fefefe',
          elevated: '#fafaf9', 
          overlay: 'rgba(28, 25, 23, 0.80)',
          glass: 'rgba(255, 255, 255, 0.10)',
          frosted: 'rgba(255, 255, 255, 0.20)',
        },
        // White theme - "Pure Elegance" colors
        white: {
          pure: '#ffffff',
          warm: '#fefefe', 
          cool: '#fdfdfe',
          snow: '#fafbfc',
          pearl: '#f8f9fb',
          whisper: '#f5f6f8',
          soft: '#f0f1f3',
          mist: '#e8eaed',
          cloud: '#dfe2e6',
          silver: '#c4c8cc',
          accent: {
            primary: '#2563eb',
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
          },
          backgrounds: {
            blue: '#f8faff',
            green: '#f6fdf9', 
            amber: '#fffbf5',
            red: '#fef7f7',
            purple: '#faf8ff',
          }
        },
        
        // Theme Variants from References
        revival: {
          primary: '#8B0000',      // Deep red
          secondary: '#FF6B35',    // Orange  
          accent: '#FFB84D',       // Golden yellow
          neutral: '#2C2C2C',      // Dark charcoal
          background: '#F5F5F5',   // Light gray
          surface: '#FFFFFF',      // Pure white
        },
        
        venetian: {
          primary: '#F7EDDA',      // Venetian Lace
          secondary: '#F0531C',    // Fiery Glow
          accent: '#09332C',       // Fence Green
          warm: '#F7DFBA',         // Macadamia Beige
          energy: '#FFA74F',       // Pumpkin Vapor
          deep: '#2E4B3C',         // Norfolk Green
        },
        
        gaming: {
          primary: '#00FF88',      // Bright green
          secondary: '#FF4458',    // Gaming red
          accent: '#8B5CF6',       // Purple
          background: '#0A0A0A',   // Deep black
          surface: '#1A1A1A',      // Dark surface
          card: '#2A2A2A',         // Card background
          text: '#FFFFFF',         // White text
          muted: '#666666',        // Muted text
        },
        // Paleta de colores personalizada
        venetian: {
          light: "#FFF5EA",
          DEFAULT: "#F7EDDA",
          dark: "#E5DBc8",
        },
        fiery: {
          light: "#FF6B3F",
          DEFAULT: "#F0531C",
          dark: "#D94817",
        },
        fence: {
          light: "#0B4A41",
          DEFAULT: "#09332C",
          dark: "#072621",
        },
        macadamia: {
          light: "#FFE9C7",
          DEFAULT: "#F7DFBA",
          dark: "#E5CDA8",
        },
        pumpkin: {
          light: "#FFB56B",
          DEFAULT: "#FFA74F",
          dark: "#FF9933",
        },
        charcoal: {
          light: "#333333",
          DEFAULT: "#222222",
          dark: "#111111",
        },
        sage: {
          light: "#E0EEC6",
          DEFAULT: "#C2D6A4",
          dark: "#A4BE82",
        },
        terracotta: {
          light: "#E07A5F",
          DEFAULT: "#D8572A",
          dark: "#C34A1D",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "3rem",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "card-flip": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-1deg)" },
          "75%": { transform: "rotate(1deg)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "pulse-subtle": "pulse-subtle 2s infinite",
        float: "float 3s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out",
        "card-flip": "card-flip 0.6s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "bounce-subtle": "bounce-subtle 0.6s ease-in-out",
        "wiggle": "wiggle 0.5s ease-in-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-bounce": "scale-bounce 0.2s ease-out",
      },
      backgroundImage: {
        "dots-light": "radial-gradient(circle, #00000005 1px, transparent 1px)",
        "dots-dark": "radial-gradient(circle, #ffffff05 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.08)",
        "inner-soft": "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
        glow: "0 0 20px rgba(240, 83, 28, 0.2)",
        "glow-strong": "0 0 30px rgba(240, 83, 28, 0.4)",
      },
      // Organic Finance typography
      fontFamily: {
        organic: ['Inter Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Charter', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
        nature: ['Atkinson Hyperlegible', 'Source Sans Pro', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        organic: '0.01em',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
