/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#4E008E',
        status: {
          verde: '#00B894',
          amarelo: '#FDCB6E',
          vermelho: '#D63031'
        },
        prioridade: {
          alta: '#E17055',
          media: '#FDCB6E',
          baixa: '#0984E3'
        },
        indicador: {
          positivo: '#00CEC9',
          negativo: '#D63031',
          neutro: '#636E72'
        },
        dark: {
          background: '#1E1E2F',
          text: '#FFFFFF'
        }
      }
    }
  },
  plugins: []
};
