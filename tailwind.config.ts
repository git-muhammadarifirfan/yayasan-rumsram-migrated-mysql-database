import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0e14",
        slate: "#101828",
        muted: "#667085",
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        teal: {
          50:"#effdfb",
          100:"#c7f9f2",
          200:"#98f0e6",
          300:"#64e2d7",
          400:"#2dd4bf",
          500:"#14b8a6",
          600:"#0f9486",
          700:"#0c6f67",
          800:"#0a4f4b",
          900:"#083a38",
        }
      },
      boxShadow: {
        soft: "0 14px 50px rgba(17, 24, 39, 0.12)",
        card: "0 10px 30px rgba(2, 6, 23, 0.10)",
      },
      borderRadius: {
        xl: "18px",
        "2xl": "24px",
      }
    },
  },
  plugins: [],
} satisfies Config;
