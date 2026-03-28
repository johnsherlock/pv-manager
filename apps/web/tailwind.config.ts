import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f3efe6',
        'surface-raised': 'rgba(255,252,245,0.88)',
        'surface-inset': 'rgba(31,42,42,0.04)',
        'on-surface': '#1f2a2a',
        'on-surface-muted': '#596868',
        'brand-primary': '#0d6b57',
        positive: '#0d6b57',
        warning: '#b45309',
        'warning-bg': 'rgba(180,83,9,0.08)',
        destructive: '#b91c1c',
        neutral: '#374151',
        border: 'rgba(31,42,42,0.12)',
        locked: 'rgba(89,104,104,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
