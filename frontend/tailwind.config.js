/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Fredoka', 'sans-serif'],
    },
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        primary: '#0ea5e9',
        success: '#10b981',
        danger: '#ef4444',
        text: '#1e293b',
        muted: '#64748b'
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
