/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cine-bg': '#0F0F10',
        'cine-surface': '#18181B',
        'cine-card': '#202024',
        'cine-border': 'rgba(255, 255, 255, 0.06)',
        'cine-text-primary': '#F5F5F5',
        'cine-text-secondary': '#A1A1AA',
        'cine-text-muted': '#71717A',
        'cine-accent': '#F4B942', // Warm amber gold
        'cine-secondary': '#7C8BFF',
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
