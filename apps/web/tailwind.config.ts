import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#f7f5ef",
        line: "#ded9ce",
        moss: "#476552",
        rust: "#a65535",
        skywash: "#dbe9ef"
      }
    }
  },
  plugins: []
};

export default config;
