import type { Config } from "tailwindcss";

// True Black (OLED) palette lives in the default zinc/black scale that
// Tailwind ships with — no custom colors needed, just used consistently.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      typography: ({ theme }: any) => ({
        invert: {
          css: {
            "--tw-prose-body": theme("colors.zinc[300]"),
            "--tw-prose-headings": theme("colors.white"),
            "--tw-prose-links": theme("colors.white"),
            "--tw-prose-bold": theme("colors.white"),
            "--tw-prose-quotes": theme("colors.zinc[400]"),
            "--tw-prose-code": theme("colors.zinc[200]"),
            "--tw-prose-hr": theme("colors.zinc[800]"),
            "--tw-prose-bullets": theme("colors.zinc[600]"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
