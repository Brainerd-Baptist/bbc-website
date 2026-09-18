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
        // Official BBC Brand Colors
        bbc: {
          blue: "#00abc9",
          "blue-dark": "#0090a8",
          "blue-light": "#33c1d9",
          "blue-pale": "#e6f7fb",
          navy: "#00205B",
          "navy-light": "#0a2d6e",
        },
        // Legacy (kept for compatibility)
        navy: {
          DEFAULT: "#00205B",
          light: "#0a2d6e",
          mid: "#001850",
          deep: "#001340",
        },
        gold: {
          DEFAULT: "#00abc9",
          light: "#33c1d9",
          dark: "#0090a8",
        },
        glass: {
          white: "rgba(255,255,255,0.06)",
          "white-md": "rgba(255,255,255,0.10)",
          "white-lg": "rgba(255,255,255,0.14)",
          blue: "rgba(0,171,201,0.06)",
          "blue-md": "rgba(0,171,201,0.12)",
          dark: "rgba(0,32,91,0.72)",
        },
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
        condensed: ["var(--font-barlow-condensed)", "sans-serif"],
        serif: ["Georgia", "'Times New Roman'", "serif"],
      },
      backgroundImage: {
        "gradient-blue": "linear-gradient(135deg, #00205B 0%, #00abc9 100%)",
        "gradient-navy": "linear-gradient(135deg, #00205B 0%, #001340 100%)",
        "gradient-hero": "linear-gradient(160deg, #00205B 60%, #0a2d6e 100%)",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
      },
      animation: {
        "fade-up": "fadeUp 0.65s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        pulse: "pulse 2s ease-in-out infinite",
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
