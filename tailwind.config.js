/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Oswald', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'fire': '0 10px 30px -14px rgba(46, 123, 255, 0.45)',
        'fire-lg': '0 18px 44px -18px rgba(11, 46, 110, 0.55)',
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(135deg, #2E7BFF 0%, #1F68E8 100%)',
      },
    },
  },
  plugins: [],
}
