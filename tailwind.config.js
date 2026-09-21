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
          DEFAULT: '#0d3b2e',
          light: '#165a45',
          dark: '#08261e',
          accent: '#7c2d3a',
          muted: '#d7e8e1',
        },
        gold: {
          DEFAULT: '#ccab66',
          light: '#e8dcc8',
          dark: '#8f7438',
        },
        cream: {
          DEFAULT: '#f4efe6',
          dark: '#eadfd0',
        },
        ink: '#0a1612',
      },
    },
  },
  plugins: [],
}

