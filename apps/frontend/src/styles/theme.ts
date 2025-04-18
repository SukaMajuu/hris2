export const colors = {
  primary: {
    DEFAULT: '#1E3A5F', // Berkeley Blue
  },
  secondary: {
    DEFAULT: '#7CA5BF', // Air Superiority Gray
  },
  accent: {
    DEFAULT: '#BA3C54', // Rose Red
  },
  semantic: {
    success: '#257047', // Jade
    warning: '#FFAB00', // Yellow Sea
    error: '#C11106', // Milano Red
    info: '#2D8EFF', // Dodger Blue
  },
  neutral: {
    black: '#000000',
    darkGrey: '#595959',
    white: '#FFFFFF',
  },
} as const;

export const theme = {
  colors,
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)'],
    },
  },
} as const;
