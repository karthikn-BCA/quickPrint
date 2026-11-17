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
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Hot Box Warm Orange
          600: '#ea580c', // Deep Amber Orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        pretzel: {
          light: '#fde68a',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          deep: '#b45309',
        },
        dark: {
          bg: '#090d16',
          surface: '#111726',
          card: '#161e31',
          border: '#25324d',
          muted: '#8b9bb4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
      }
    },
  },
  plugins: [],
}
