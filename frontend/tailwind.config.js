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
        // Semantic design tokens mapped to CSS variables
        cp: {
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          'primary-light': 'var(--color-primary-light)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          highlight: 'var(--color-highlight)',
          supporting: 'var(--color-supporting)',
          muted: 'var(--color-muted)',
          terracotta: 'var(--color-terracotta)',
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-alt': 'var(--color-surface-alt)',
          text: 'var(--color-text)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          border: 'var(--color-border)',
          'border-strong': 'var(--color-border-strong)',
          'sidebar-bg': 'var(--color-sidebar-bg)',
          'sidebar-surface': 'var(--color-sidebar-surface)',
          'sidebar-text': 'var(--color-sidebar-text)',
          'sidebar-muted': 'var(--color-sidebar-muted)',
          'sidebar-border': 'var(--color-sidebar-border)',
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
