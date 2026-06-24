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
          50: '#FDE8F0',
          100: '#F8D7E3',
          200: '#F4BFD3',
          300: '#F0A7C3',
          400: '#EB8FB3',
          500: '#FF7AA2',
          600: '#E8608A',
          700: '#D04872',
          800: '#B8305A',
          900: '#A01842',
        },
        accent: {
          50: '#E6FFE6',
          100: '#B3FFB3',
          200: '#80FF80',
          300: '#4DFF4D',
          400: '#1AFF1A',
          500: '#34C759',
          600: '#28A745',
          700: '#1E7E34',
          800: '#155724',
          900: '#0D3B1E',
        },
        surface: {
          50: '#FDF8FA',
          100: '#FFF8FA',
          200: '#FFF4F7',
          300: '#F1E6EA',
          400: '#E0D0D8',
          500: '#C4A8B6',
          600: '#A888A0',
          700: '#8C688A',
          800: '#704874',
          900: '#54285E',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(255, 122, 162, 0.08)',
        'card-hover': '0 8px 24px rgba(255, 122, 162, 0.12)',
        'pink': '0 4px 12px rgba(255, 122, 162, 0.2)',
        'pink-lg': '0 8px 24px rgba(255, 122, 162, 0.25)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      backgroundImage: {
        'gradient-pink': 'linear-gradient(135deg, #FF7AA2 0%, #C084FC 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFF4F7 0%, #F8D7E3 50%, #FFF4F7 100%)',
      },
    },
  },
  plugins: [],
}
