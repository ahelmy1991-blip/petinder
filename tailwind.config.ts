import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "380px",
      },
      colors: {
        brand: {
          50:  "#fff1f1",
          100: "#ffe4e4",
          200: "#ffc9c9",
          300: "#ffa0a0",
          400: "#ff6b6b",
          500: "#ff3a3a",
          600: "#ed1515",
          700: "#c80d0d",
          800: "#a50f0f",
          900: "#881414",
        },
        like:  "#4ade80",
        pass:  "#f87171",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fly-right": {
          "0%":   { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(200%) rotate(25deg)", opacity: "0" },
        },
        "fly-left": {
          "0%":   { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(-200%) rotate(-25deg)", opacity: "0" },
        },
        "pop-in": {
          "0%":   { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "score-fill": {
          "0%":   { width: "0%" },
          "100%": { width: "var(--score-width)" },
        },
      },
      animation: {
        "fly-right":  "fly-right 0.35s ease-in forwards",
        "fly-left":   "fly-left 0.35s ease-in forwards",
        "pop-in":     "pop-in 0.25s ease-out",
        "slide-up":   "slide-up 0.3s ease-out",
        "score-fill": "score-fill 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
