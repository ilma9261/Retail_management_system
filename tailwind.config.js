/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7c98fb',
          500: '#526cf5',
          600: '#3547eb',
          700: '#2634d5',
          800: '#1e29a8',
          900: '#1b2684',
          950: '#0f172a', // Deep slate navy
        },
        navy: {
          800: '#1e293b',
          850: '#172233',
          900: '#0f172a',
          950: '#0a0f1d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}