import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Overall app theme: soft, warm beige.
        sand: {
          50: "#FBF8F1",
          100: "#F6F0E4",
          200: "#EDE2CB",
          300: "#E0CFA8",
          400: "#CBAE78",
          500: "#B08D57",
          600: "#8C6D3F",
          700: "#6B5230",
          800: "#4C3A22",
        },
        // Flashcard face background: pale lemon.
        lemon: {
          100: "#FDFAE2",
          200: "#FAF3B8",
          300: "#F4E888",
        },
        // Left/right nav button strips: light green.
        leaf: {
          100: "#E7F3DE",
          200: "#D0E8BE",
          300: "#B4D89A",
          400: "#95C476",
        },
        // Headword kanji color: brown.
        kanjibrown: {
          DEFAULT: "#6B4226",
          dark: "#4A2C18",
        },
      },
      fontFamily: {
        // True "教科書体" (UD Digital Kyokasho) ships with Windows 10/11 but
        // isn't distributable as a webfont, so we prefer it locally when
        // present and fall back to BIZ UDPMincho (Morisawa's UD font
        // explicitly modeled on textbook print) for everyone else.
        kyokasho: [
          '"UD デジタル 教科書体 N-R"',
          '"UDDigiKyokashoN-R"',
          '"UD Digital Kyokasho NK-R"',
          "var(--font-kyokasho)",
          "serif",
        ],
        vietnamese: ['"Times New Roman"', "Times", "serif"],
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(107, 66, 38, 0.25)",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
