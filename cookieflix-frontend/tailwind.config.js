/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#ff6b6b',
        'secondary': '#4ecdc4',
        'tertiary': '#ffd166',
        'light-bg': '#f7f7f7',
        'dark-bg': '#2f3542',
        'dark-text': '#333333',
        'light-text': '#ffffff',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}