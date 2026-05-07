/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Dark surface palette
        surface: {
          950: '#0a0a0f',
          900: '#0f0f18',
          800: '#16161f',
          700: '#1e1e2a',
          600: '#252535',
          500: '#2e2e42',
        },
        accent: {
          DEFAULT: '#7c6af7',
          dim: '#5b51c4',
          glow: 'rgba(124, 106, 247, 0.15)',
        },
        jade: {
          DEFAULT: '#2dd4a0',
          dim: '#1a9970',
        },
        amber: {
          chat: '#f59e0b',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(124, 106, 247, 0.2)',
        'glow-jade':   '0 0 16px rgba(45, 212, 160, 0.15)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};