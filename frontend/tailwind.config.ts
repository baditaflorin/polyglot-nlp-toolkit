import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        paper: '#fbfbf8',
        signal: '#0f766e',
        plum: '#6d3f6b',
        amber: '#b45309',
      },
      boxShadow: {
        panel: '0 1px 2px rgb(15 23 42 / 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
