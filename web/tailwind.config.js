import { heroui } from '@heroui/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1600px',
      '4xl': '1920px',
      ultrawide: { raw: '(min-aspect-ratio: 21/9)' },
      'super-ultrawide': { raw: '(min-aspect-ratio: 32/9)' },
    },
    extend: {
      colors: {
        ink: {
          0: '#0b0b0d',
          1: '#18181d',
          2: '#1e1e24',
          3: '#33333d',
          4: '#4a4a57',
        },
        bone: {
          DEFAULT: '#e6e6ec',
          2: '#c3c3ce',
          3: '#9a9aa8',
          4: '#6e6e7d',
        },
        ember: {
          DEFAULT: '#e8172c',
          2: '#ff4d5f',
          3: '#9b0b1a',
        },
        brass: {
          DEFAULT: '#e8172c',
          2: '#ff4d5f',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        ui: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        bezel: '1rem',
        card: '0.75rem',
      },
      boxShadow: {
        hairline: 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
        lift: '0 18px 40px -20px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(232,23,44,0.45)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in': 'fade-in 200ms cubic-bezier(0.23, 1, 0.32, 1) both',
        'scale-in': 'scale-in 220ms cubic-bezier(0.23, 1, 0.32, 1) both',
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: 'moxha',
      themes: {
        moxha: {
          extend: 'dark',
          colors: {
            background: '#0b0b0d',
            foreground: '#e6e6ec',
            divider: '#26262e',
            focus: '#e8172c',
            content1: '#18181d',
            content2: '#1e1e24',
            content3: '#33333d',
            content4: '#4a4a57',
            primary: {
              DEFAULT: '#e8172c',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT: '#e8172c',
              foreground: '#ffffff',
            },
            success: {
              DEFAULT: '#1f9d63',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT: '#c98a1c',
              foreground: '#ffffff',
            },
            default: {
              50: '#131317',
              100: '#18181d',
              200: '#26262e',
              300: '#33333d',
              400: '#4a4a57',
              500: '#6e6e7d',
              600: '#9a9aa8',
              700: '#c3c3ce',
              800: '#e6e6ec',
              900: '#f2f2f5',
              DEFAULT: '#18181d',
              foreground: '#e6e6ec',
            },
          },
          layout: {
            disabledOpacity: '0.35',
            radius: { small: '6px', medium: '8px', large: '12px' },
            borderWidth: { small: '1px', medium: '1px', large: '2px' },
          },
        },
      },
    }),
  ],
}
