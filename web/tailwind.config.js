/** @type {import('tailwindcss').Config} */
import { heroui } from '@heroui/react'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [
    heroui({
      defaultTheme: 'dark'
    })
  ],
  darkMode: "class",
}