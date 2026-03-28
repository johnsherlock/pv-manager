import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Solar-themed semantic color palette
        // surface roles
        surface: {
          DEFAULT: '#f6f2ea',
          raised: '#fefcf7',
          inset: '#ede8df',
        },
        // brand
        brand: {
          primary: '#d97706',   // solar amber
        },
        // state colors
        positive: {
          DEFAULT: '#059669',
          fg: '#ffffff',
          subtle: '#d1fae5',
        },
        warning: {
          DEFAULT: '#d97706',
          fg: '#ffffff',
          subtle: '#fef3c7',
        },
        destructive: {
          DEFAULT: '#dc2626',
          fg: '#ffffff',
          subtle: '#fee2e2',
        },
        neutral: {
          grid: '#6b7280',
          import: '#9ca3af',
        },
        trust: {
          positive: '#059669',
        },
        locked: {
          DEFAULT: '#f3f4f6',
          border: '#d1d5db',
        },
        'on-surface': {
          DEFAULT: '#1f2a2a',
          muted: '#596868',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
