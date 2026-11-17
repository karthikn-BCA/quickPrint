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
          50: '#f5f7f4',
          100: '#e3e8e0', // Borders: #E3E8E0
          200: '#cbd5c7',
          300: '#a3b09f', // Secondary: Muted Sage: #A3B09F
          400: '#7c8e77',
          500: '#596b5d', // Primary: Deep Sage: #596B5D
          600: '#48584c',
          700: '#3a463d',
          800: '#303830', // Text: Dark Charcoal: #303830
          900: '#222822',
          950: '#141814',
        },
        sage: {
          light: '#eef1ec',
          muted: '#a3b09f', // #A3B09F
          deep: '#596b5d',  // #596B5D
          dark: '#303830',  // #303830
        },
        cream: {
          bg: '#f7f8f4',    // Background: Soft Cream #F7F8F4
          border: '#e3e8e0', // Borders: #E3E8E0
        },
        'dark-bg': '#121713',
        'dark-surface': '#181f19',
        'dark-card': '#1f2721',
        'dark-border': '#2d382f',
        'dark-muted': '#8fa08c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(89, 107, 93, 0.08)',
        'card': '0 10px 30px -5px rgba(48, 56, 48, 0.08)',
        'glow': '0 0 25px -5px rgba(89, 107, 93, 0.35)',
      }
    },
  },
  plugins: [],
}
