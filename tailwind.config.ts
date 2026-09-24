import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "#640810",
          50: "#FAF0F1",
          100: "#F5DFE2",
          200: "#EBBDC3",
          300: "#DF9AA4",
          400: "#CE5A6B",
          500: "#8C1320",
          600: "#7A0C16",
          700: "#640810", // Primary from logo
          800: "#4A070D",
          900: "#320408",
          950: "#1C0204",
        },
        gold: {
          DEFAULT: "#DCA40C",
          50: "#FDFCF7",
          100: "#FDF8E8", // Soft Gold Tint
          200: "#FAF0CC",
          300: "#F5E4A0",
          400: "#F3C64F", // Gold Highlight
          500: "#E0AC18",
          600: "#DCA40C", // Core Gold from logo
          700: "#B88008", // Antique Gold
          800: "#8C5F05",
          900: "#5E3E02",
        },
        surface: {
          canvas: "#FDFBF7", // Warm Ivory background
          muted: "#FAF7F2",
          card: "#FFFFFF",
          border: "#EADBB6", // Warm golden sand border
        },
        charcoal: {
          DEFAULT: "#1C1917",
          900: "#0A0A0A", // Text from logo
          muted: "#78716C",
        },
      },
      fontFamily: {
        sans: ["Cairo", "system-ui", "sans-serif"],
        display: ["Alexandria", "Cairo", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(100, 8, 16, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 10px 30px -4px rgba(100, 8, 16, 0.12), 0 4px 12px -2px rgba(220, 164, 12, 0.1)",
        gold: "0 0 25px -4px rgba(220, 164, 12, 0.35)",
        burgundy: "0 10px 25px -5px rgba(100, 8, 16, 0.3)",
        glass: "0 8px 32px 0 rgba(100, 8, 16, 0.08)",
        "glass-elevated": "0 20px 48px -8px rgba(0, 0, 0, 0.12), 0 8px 24px -4px rgba(100, 8, 16, 0.08)",
        specular: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(250%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "sonar-ping": {
          "0%": { transform: "scale(0.8)", opacity: "0.9" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite ease-in-out",
        float: "float 4s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "radar-sweep": "radar-sweep 4s linear infinite",
        "sonar-ping": "sonar-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;

