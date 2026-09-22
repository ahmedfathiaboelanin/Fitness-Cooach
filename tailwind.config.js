/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        fire: {
          yellow: '#FFD166',
          orange: '#E11D2E',
          ember: '#B91C1C',
          red: '#7F1D1D',
          crimson: '#E11D2E',
          coal: '#0C0A09',
          smoke: '#1C1917',
        },
        dark: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Oswald', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'fire': '0 10px 40px -10px rgba(225, 29, 46, 0.55)',
        'fire-lg': '0 20px 60px -12px rgba(185, 28, 28, 0.55)',
        'glow': '0 0 30px rgba(225, 29, 46, 0.40)',
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(135deg, #FFD166 0%, #EF233C 45%, #B91C1C 75%, #7F1D1D 100%)',
        'fire-dark': 'linear-gradient(135deg, #EF233C 0%, #7F1D1D 100%)',
        'coal-grid': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      animation: {
        flicker: 'flicker 2.2s ease-in-out infinite',
        floaty: 'floaty 5s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        shine: 'shine 2.8s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
      },
    },
  },
  plugins: [],
}
