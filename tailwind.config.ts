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
        brand: {
          navy: "#09090B", // Preto nobre paulista
          slate: "#18181B", // Ardósia escura paulista
          accent: "#DC2626", // Vermelho bandeirante
          red: {
            50: "#FEF2F2",
            100: "#FEE2E2",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#EF4444",
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
            950: "#450A0A",
          },
          dark: {
            950: "#050505",
            900: "#09090B",
            850: "#121214",
            800: "#18181B",
            700: "#27272A",
            600: "#3F3F46",
          },
          gold: {
            400: "#FBBF24",
            500: "#F59E0B",
            600: "#D97706",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "civic": "0 4px 20px -2px rgba(185, 28, 28, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08)",
        "civic-lg": "0 10px 30px -4px rgba(185, 28, 28, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
