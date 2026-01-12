/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: This line tells Tailwind to look inside .jsx files
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        china: {
          red: '#8B0000',      // Deep Imperial Red
          lightRed: '#C41E3A', // Brighter Red
          gold: '#FFD700',     // Bright Gold
          darkGold: '#B8860B', // Muted Gold
          midnight: '#0F0F10', // Background
        }
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'serif'], // Enforce serif font
      }
    },
  },
  plugins: [],
}