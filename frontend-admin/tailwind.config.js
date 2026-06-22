/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d4ff',
          200: '#80b8ff',
          300: '#4d9cff',
          400: '#1a80ff',
          500: '#0055A4',
          600: '#004080',
          700: '#003366',
          800: '#00264d',
          900: '#001a33',
        },
        accent: {
          50: '#e6ffe6',
          100: '#b3ffb3',
          200: '#80ff80',
          300: '#4dff4d',
          400: '#1aff1a',
          500: '#00C853',
          600: '#00a843',
          700: '#008033',
          800: '#006626',
          900: '#004d1a',
        },
        surface: {
          50: '#F5F7FA',
          100: '#EBEEF3',
          200: '#D5DBE5',
          300: '#A9B4C8',
          400: '#7D8DA8',
          500: '#5C6B89',
          600: '#43506C',
          700: '#2E3950',
          800: '#1C2438',
          900: '#0F1422',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
