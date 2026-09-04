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
          DEFAULT: "#0a192f", // Exact Brand Navy from Logo
          dark: "#020c1b",
          light: "#112240",
          lighter: "#233554",
        },
        gold: {
          DEFAULT: "#eab308", // Brand Gold
          light: "#facc15",
          dark: "#ca8a04",
        },
        primary: {
          DEFAULT: "#0a192f", // Alias for Brand Navy
        },
        brand: {
          navy: "#0a192f", // Exact Brand Navy
          gold: "#eab308", // Brand Gold
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-poppins)", "system-ui", "sans-serif"],
        heading: ["var(--font-varsity)", "var(--font-montserrat)", "'Arial Black', Impact, 'Franklin Gothic Bold', sans-serif"],
        varsity: ["var(--font-varsity)", "var(--font-montserrat)", "'Arial Black', Impact, 'Franklin Gothic Bold', sans-serif"],
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      },
      animation: {
        blob: "blob 7s infinite",
        ticker: "ticker 40s linear infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
export default config;

