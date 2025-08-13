/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#CCFF33',
          'lime-600': '#B5F220',
          'lime-700': '#9AD60F',
          'lime-800': '#7AB505',
          ink: '#0B0B0A',
        },
        base: {
          text: '#141414',
          muted: '#606060',
          disabled: '#A8A8A8',
          white: '#FFFFFF',
          cream: '#F6F3EA',
          'cream-2': '#EFE9DC',
          border: '#E6E0D3',
          card: '#FFFFFF',
          overlay: 'rgba(0,0,0,0.04)',
        },
        accents: {
          blue: '#5CC7FF',
          purple: '#A894FF',
          orange: '#FF9D66',
          pink: '#FF7BB4',
          teal: '#31D2C3',
        },
        feedback: {
          success: '#23C26B',
          warning: '#FFB020',
          danger: '#EC5B62',
          info: '#4CB3FF',
        },
      },
      fontFamily: {
        heading: ['Satoshi', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
        floating: '0 12px 32px rgba(0,0,0,0.12)',
        soft: '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};


