/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Poppins"', 'sans-serif'],
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
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'float': 'float 10s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
