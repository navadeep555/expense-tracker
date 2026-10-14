/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#070d1f',
          900: '#0a1128',
          800: '#101b3b',
          700: '#17264f',
          600: '#22346a',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.08)',
        pop: '0 20px 50px -12px rgba(10,17,40,.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pop-in': {
          from: { opacity: 0, transform: 'translateY(12px) scale(.98)' },
          to: { opacity: 1, transform: 'none' },
        },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
      },
      animation: {
        'fade-in': 'fade-in .2s ease-out',
        'pop-in': 'pop-in .22s ease-out',
        'slide-in': 'slide-in .25s ease-out',
      },
    },
  },
  plugins: [],
};
