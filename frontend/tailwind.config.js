/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm near-black — used for dark sections & primary text on light bg
        ink: { DEFAULT: '#1C1A17', light: '#2A2722', soft: '#403C35' },
        // Warm off-white — main page background
        cream: { DEFAULT: '#FAF6F0', dark: '#F0E9DD', deep: '#E8DFCF' },
        // Single accent colour — terracotta. Used deliberately, not everywhere.
        rust: { DEFAULT: '#B5582C', dark: '#943F1C', light: '#D17B4F', 50: '#FBEEE6' },
        // Secondary accent — muted forest, used for success/stock states
        forest: { DEFAULT: '#3F5246', dark: '#2D3B33', light: '#5B7264' },
        // Neutral text/border tones
        stone: { DEFAULT: '#8A8378', light: '#B5AFA4', dark: '#5C5750' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.12em',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,26,23,0.04), 0 8px 24px -8px rgba(28,26,23,0.08)',
        'card-hover': '0 1px 2px rgba(28,26,23,0.04), 0 16px 32px -12px rgba(28,26,23,0.16)',
        focus: '0 0 0 3px rgba(181,88,44,0.25)',
      },
    },
  },
  plugins: [],
}
