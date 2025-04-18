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

export const typography = {
  h1: {
    className: 'typography-h1',
  },
  h2: {
    className: 'typography-h2',
  },
  h3: {
    className: 'typography-h3',
  },
  h4: {
    className: 'typography-h4',
  },
  h5: {
    className: 'typography-h5',
  },
  h6: {
    className: 'typography-h6',
  },
  subtitle1: {
    className: 'typography-subtitle1',
  },
  subtitle2: {
    className: 'typography-subtitle2',
  },
  body1: {
    className: 'typography-body1',
  },
  body2: {
    className: 'typography-body2',
  },
  body3: {
    className: 'typography-body3',
  },
  button: {
    className: 'typography-button',
  },
  caption: {
    className: 'typography-caption',
  },
  overline: {
    className: 'typography-overline',
  },
} as const;

export const theme = {
  colors,
  typography,
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)'],
    },
  },
} as const;
