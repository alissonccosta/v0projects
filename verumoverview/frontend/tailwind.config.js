import designTokens from './src/constants/design-tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        primaryLight: designTokens.colors.primaryLight,
        primaryDark: designTokens.colors.primaryDark,
        white: designTokens.colors.white,
        status: designTokens.colors.status,
        prioridade: designTokens.colors.prioridade,
        indicators: designTokens.colors.indicators,
        dark: designTokens.colors.dark,
        gray: designTokens.colors.gray
      },
      fontFamily: {
        sans: designTokens.typography.fonts
      }
    }
  },
  plugins: []
};
