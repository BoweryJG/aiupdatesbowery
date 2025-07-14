/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'space-black': '#0A0A0F',
        'electric-cyan': '#00D9FF',
        'quantum-purple': '#8B5CF6',
        'neon-green': '#10F88F',
        'solar-orange': '#FF6B35',
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { filter: 'brightness(1) blur(0px)' },
          '100%': { filter: 'brightness(1.2) blur(2px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}