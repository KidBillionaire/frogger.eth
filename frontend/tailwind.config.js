/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        gold: {
          500: '#DAA520',
          600: '#B8860B',
          700: '#8B7500',
        },
      },
      animation: {
        float: 'float 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-10vh) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}