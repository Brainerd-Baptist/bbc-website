import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a1628",
          light: "#0f2040",
          mid: "#122540",
          deep: "#07101e",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e0bc6a",
          dark: "#a8893a",
        },
        glass: {
          white: "rgba(255,255,255,0.06)",
          "white-md": "rgba(255,255,255,0.10)",
          "white-lg": "rgba(255,255,255,0.14)",
          dark: "rgba(10,22,40,0.72)",
          "dark-md": "rgba(10,22,40,0.85)",
        },
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
        condensed: ["var(--font-barlow-condensed)", "sans-serif"],
        serif: ["var(--font-lora)", "serif"],
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #0a1628 0%, #0f2040 100%)",
        "gradient-gold": "linear-gradient(135deg, #c9a84c 0%, #a8893a 100%)",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        countdown: "pulse 1s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
