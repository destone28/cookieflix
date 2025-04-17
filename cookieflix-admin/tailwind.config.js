// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#ff6b6b',     // Rosa corallo
        'secondary': '#4ecdc4',   // Turchese
        'tertiary': '#ffd166',    // Giallo ambra
        'light-bg': '#f7f7f7',    // Sfondo chiaro
        'dark-bg': '#2f3542',     // Sfondo scuro
        'dark-text': '#333333',   // Testo scuro
        'light-text': '#ffffff',  // Testo chiaro
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}