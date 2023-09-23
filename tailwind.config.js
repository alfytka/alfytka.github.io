/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        figtree: ['Figtree'],
      }
    },
  },
  plugins: [],
}