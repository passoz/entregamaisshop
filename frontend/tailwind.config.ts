import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#067BC2",
          sky: "#84BCDA",
          amber: "#ECC30B",
          coral: "#F37748",
          pink: "#D56062",
        },
        ze: {
          yellow: "#F7E01B",
          black: "#222222",
          red: "#E31B23",
          gray: "#F4F4F4",
          white: "#FFFFFF",
        },
      },
    }
  },
  plugins: [],
} satisfies Config;
