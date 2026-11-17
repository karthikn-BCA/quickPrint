/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Theme: Muted Sage & Forest Green
        sage: {
          DEFAULT: '#7B9669',
          hover: '#698259',
          light: '#8da67a',
          pale: '#BAC8B1',
        },
        forest: {
          DEFAULT: '#243021',
          light: '#404E3B',
          surface: '#2F3E2B',
          dark: '#1B2418',
        },
        tealGrey: '#6C8480',
        lightGrey: '#E6E6E6',

        // Dark Theme: Copper Aquamarine Dream
        aquamarine: {
          DEFAULT: '#30525C',
          hover: '#3D6872',
          light: '#4C848D',
          dark: '#162429',
          surface: '#1E343B',
        },
        copper: {
          DEFAULT: '#DCAA89',
          hover: '#e6b99a',
        },
        burntOrange: '#C35627',
        terracotta: '#D6794D',
        mutedTeal: '#4C848D',
        warmGrey: '#BFB9B5',

        // Semantic tokens with safe fallbacks
        cp: {
          primary: 'var(--color-primary, #7B9669)',
          'primary-hover': 'var(--color-primary-hover, #698259)',
          'primary-light': 'var(--color-primary-light, #8da67a)',
          accent: 'var(--color-accent, #BAC8B1)',
          'accent-hover': 'var(--color-accent-hover, #a8b89e)',
          highlight: 'var(--color-highlight, #5A7548)',
          supporting: 'var(--color-supporting, #6C8480)',
          muted: 'var(--color-muted, #9BAEA0)',
          terracotta: 'var(--color-terracotta, #7B9669)',
          bg: 'var(--color-bg, #F5F7F4)',
          surface: 'var(--color-surface, #FFFFFF)',
          'surface-alt': 'var(--color-surface-alt, #EBF0E8)',
          text: 'var(--color-text, #243021)',
          'text-secondary': 'var(--color-text-secondary, #485A44)',
          'text-muted': 'var(--color-text-muted, #6C8480)',
          border: 'var(--color-border, #D5DDD2)',
          'border-strong': 'var(--color-border-strong, #C2CEC0)',
          'sidebar-bg': 'var(--color-sidebar-bg, #243021)',
          'sidebar-surface': 'var(--color-sidebar-surface, #2F3E2B)',
          'sidebar-text': 'var(--color-sidebar-text, #E6E6E6)',
          'sidebar-muted': 'var(--color-sidebar-muted, #BAC8B1)',
          'sidebar-border': 'var(--color-sidebar-border, #3A4C36)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
