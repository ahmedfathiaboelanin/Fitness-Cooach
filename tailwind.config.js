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
          yellow: '#5B9CFF',
          orange: '#2E7BFF',
          ember: '#0B2E6E',
          red: '#0A1B3D',
          crimson: '#2E7BFF',
          silver: '#C9D6F2',
          coal: '#04070E',
          smoke: '#0A1222',
        },
        dark: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Oswald', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'fire': '0 10px 30px -14px rgba(46, 123, 255, 0.45)',
        'fire-lg': '0 18px 44px -18px rgba(11, 46, 110, 0.55)',
        'glow': '0 0 26px rgba(46, 123, 255, 0.28)',
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(135deg, #2E7BFF 0%, #1F68E8 100%)',
        'fire-dark': 'linear-gradient(135deg, #2E7BFF 0%, #0B2E6E 100%)',
        'coal-grid': 'linear-gradient(rgba(148,178,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,178,255,0.05) 1px, transparent 1px)',
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
