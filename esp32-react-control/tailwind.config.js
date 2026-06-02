/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bio-bg': '#0B0F19',
        'bio-card': '#151B2C',
        'bio-border': '#222E4A',
        'bio-green': '#10B981',
        'bio-muted': '#8492B4',
        'bio-red': '#EF4444',
        'bio-blue': '#3B82F6',
        'bio-gold': '#F59E0B',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
