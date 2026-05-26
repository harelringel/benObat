/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-pink': '#EC4899',
        'primary-blue': '#3B82F6',
        'gold': '#F59E0B',
        'dark-bg': '#1E1B4B',
        'card-bg': '#FFFFFF',
      },
      fontFamily: {
        'heebo': ['Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
