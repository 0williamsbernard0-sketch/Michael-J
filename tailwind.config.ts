import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12151A",
        panel: "#161A20",
        gold: "#C9A227",
        teal: "#1F6F6B",
        wine: "#5C1B24",
        ivory: "#F1ECDF",
      },
    },
  },
  plugins: [],
};

export default config;

