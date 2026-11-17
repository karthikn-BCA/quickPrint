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
        // Light Theme: Copper Aquamarine Dream
        aquamarine: {
          DEFAULT: '#30525C',
          hover: '#264248',
          light: '#3d6872',
        },
        copper: '#DCAA89',
        burntOrange: '#C35627',
        terracotta: '#D6794D',
        mutedTeal: '#4C848D',
        warmGrey: '#BFB9B5',

        // Dark Theme: Muted Sage & Forest Green
        sage: {
          DEFAULT: '#7B9669',
          hover: '#8da67a',
          pale: '#BAC8B1',
        },
        forest: {
          DEFAULT: '#404E3B',
          surface: '#4A5B44',
          dark: '#2E3A2A',
        },
        tealGrey: '#6C8480',
        lightGrey: '#E6E6E6',

        // Semantic tokens with safe fallbacks
        cp: {
          primary: 'var(--color-primary, #30525C)',
          'primary-hover': 'var(--color-primary-hover, #264248)',
          'primary-light': 'var(--color-primary-light, #3d6872)',
          accent: 'var(--color-accent, #DCAA89)',
          'accent-hover': 'var(--color-accent-hover, #d49b75)',
          highlight: 'var(--color-highlight, #C35627)',
          supporting: 'var(--color-supporting, #4C848D)',
          muted: 'var(--color-muted, #BFB9B5)',
          terracotta: 'var(--color-terracotta, #D6794D)',
          bg: 'var(--color-bg, #FAFAF8)',
          surface: 'var(--color-surface, #FFFFFF)',
          'surface-alt': 'var(--color-surface-alt, #F5F3F0)',
          text: 'var(--color-text, #1a2a2e)',
          'text-secondary': 'var(--color-text-secondary, #4a5d62)',
          'text-muted': 'var(--color-text-muted, #7a8a8e)',
          border: 'var(--color-border, #e0ddd8)',
          'border-strong': 'var(--color-border-strong, #ccc8c2)',
          'sidebar-bg': 'var(--color-sidebar-bg, #1e3a40)',
          'sidebar-surface': 'var(--color-sidebar-surface, #2a4a52)',
          'sidebar-text': 'var(--color-sidebar-text, #e8ebe6)',
          'sidebar-muted': 'var(--color-sidebar-muted, #a0b4b0)',
          'sidebar-border': 'var(--color-sidebar-border, #2f4f56)',
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
