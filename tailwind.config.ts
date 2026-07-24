import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDFAFA',
          100: '#D2F1F1',
          200: '#A8E2E1',
          300: '#74CBCA',
          400: '#3FADAC',
          500: '#1D8C8B',
          600: '#146F6F',
          700: '#10595A',
          800: '#0D4546',
          900: '#0A3435',
        },
        ink: {
          50: '#F4F6F8',
          100: '#E4E8EC',
          200: '#C9D1D9',
          300: '#A3AFBC',
          400: '#77879A',
          500: '#56677C',
          600: '#3F4E61',
          700: '#2E3B4B',
          800: '#212B38',
          900: '#161D26',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E7EAED',
        },
        success: { 50: '#EAFBF1', 500: '#1C9A5B', 700: '#157A48' },
        warning: { 50: '#FFF6E8', 500: '#E08A1E', 700: '#B36A11' },
        danger: { 50: '#FDEDEA', 500: '#C4432E', 700: '#9C3423' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        h1: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        h2: ['1.375rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        h3: ['1.125rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        body: ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.125rem' }],
        label: ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }],
        caption: ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(16, 24, 32, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
