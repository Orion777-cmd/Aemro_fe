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
        gold: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c0',
          300: '#fff580',
          400: '#ffed40',
          500: '#FFD700',
          600: '#FFA500',
          700: '#cc9900',
          800: '#997700',
          900: '#665500',
        },
      },
    },
  },
  plugins: [],
};
export default config;
