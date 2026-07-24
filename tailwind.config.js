/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: '#050505',
        foreground: '#f5f5f5',
        border: '#1f1f1f',
        input: '#1f1f1f',
        ring: '#f43f5e',
        dark: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#111111',
          600: '#1a1a1a',
          500: '#222222',
          400: '#2a2a2a',
          300: '#333333',
          200: '#3a3a3a',
          100: '#444444',
        },
        neon: {
          rose: '#f5f5f5',
          pink: '#e5e5e5',
          blush: '#d4d4d4',
          crimson: '#e5e5e5',
          wine: '#a3a3a3',
          cyan: '#d4d4d4',
          purple: '#e5e5e5',
          orange: '#d4d4d4',
          red: '#e5e5e5',
          green: '#ffffff',
        }
      },
      animation: {
        'entrance': 'entrance 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'grid-dots': 'grid-dots 20s linear infinite',
      },
      keyframes: {
        entrance: {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(244, 63, 94, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(244, 63, 94, 0.6)' },
        },
        'grid-dots': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
      },
      backgroundImage: {
        'grid-dots': 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-dots': '50px 50px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
