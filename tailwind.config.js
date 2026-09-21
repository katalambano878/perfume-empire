/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        handwriting: ['Pacifico', 'cursive'],
      },
      colors: {
        brand: {
          DEFAULT: '#c41e3a',
          light: '#dc3b54',
          dark: '#8a1528',
          accent: '#111111',
          muted: '#f8d7dc',
        },
        gold: {
          DEFAULT: '#c41e3a',
          light: '#f8d7dc',
          dark: '#8a1528',
        },
        cream: {
          DEFAULT: '#ffffff',
          dark: '#e8e8e8',
        },
        ink: '#111111',
      },
    },
  },
  plugins: [],
}
