import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#42690e',
          container: '#8fbc5a',
          'on-container': '#2b4a00',
          fixed: '#c1f188',
          'fixed-dim': '#a6d56f',
        },
        secondary: {
          DEFAULT: '#396a1c',
          container: '#b9f393',
          'on-container': '#3f7021',
        },
        tertiary: {
          DEFAULT: '#904181',
          container: '#eb90d6',
          'on-container': '#6e2362',
        },
        surface: {
          DEFAULT: '#F9FAF7',
          dim: '#dcd9d9',
          bright: '#fcf9f8',
          'container-lowest': '#ffffff',
          'container-low': '#f6f3f2',
          container: '#f0eded',
          'container-high': '#eae7e7',
          'container-highest': '#e5e2e1',
        },
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#43493a',
        outline: '#737969',
        'outline-variant': '#c3c9b6',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'headline-xl-mobile': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'headline-lg': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '14px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'gutter': '1rem',
        'gutter-sm': '0.5rem',
        'gutter-lg': '1.5rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
