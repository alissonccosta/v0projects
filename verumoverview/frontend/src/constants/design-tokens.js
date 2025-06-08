const designTokens = {
  colors: {
    primary: '#FFFFFF',
    secondary: '#4E008E',
    primaryLight: '#EAE0F5',
    primaryDark: '#3A0066',
    white: '#FFFFFF',
    status: {
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#D63031'
    },
    prioridade: {
      emergencial: '#D63031',
      muitoAlta: '#E17055',
      alta: '#FDCB6E',
      media: '#00B894',
      baixa: '#0984E3'
    },
    indicators: {
      positive: '#00CEC9',
      negative: '#D63031',
      neutral: '#636E72'
    },
    dark: {
      background: '#1E1E2F',
      card: '#2A2A3D',
      text: '#FFFFFF'
    },
    gray: {
      light: '#F1F1F1',
      medium: '#A0A0A0',
      border: '#E5E5E5'
    }
  },
  typography: {
    fonts: ['Inter', 'Open Sans', 'Roboto', 'sans-serif'],
    sizes: {
      h1: '24px',
      h2: '18px',
      h3: '16px',
      base: '14px',
      large: '16px'
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    small: '4px',
    medium: '6px',
    large: '10px'
  },
  shadows: {
    light: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.15)'
  },
  transitions: {
    fast: '200ms',
    medium: '300ms'
  }
};

export default designTokens;
