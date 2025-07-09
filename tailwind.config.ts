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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
