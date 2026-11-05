/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Muted Semantics (Tuân thủ UI Rules của PKS Portal)
        semantic: {
          emerald: {
            light: '#065F46',
            dark: '#34D399',
            borderLight: '#047857',
            borderDark: '#065F46',
            bgLight: '#ECFDF5',
            bgDark: 'rgba(6, 78, 59, 0.25)',
          },
          crimson: {
            light: '#991B1B',
            dark: '#F87171',
            borderLight: '#B91C1C',
            borderDark: '#991B1B',
            bgLight: '#FEF2F2',
            bgDark: 'rgba(127, 29, 29, 0.25)',
          },
          amber: {
            light: '#92400E',
            dark: '#FBBF24',
            borderLight: '#B45309',
            borderDark: '#92400E',
            bgLight: '#FFFBEB',
            bgDark: 'rgba(120, 53, 15, 0.25)',
          },
        },
      },
      minHeight: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
