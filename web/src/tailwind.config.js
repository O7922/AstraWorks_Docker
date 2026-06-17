/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './common/**/*.{ts,html}',
    './features/**/*.{ts,html}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5edff',
          100: '#e9d8fd',
          200: '#d6b6f8',
          300: '#bc8df0',
          400: '#a06be0',
          500: '#8b5cd6',
          600: '#7a4cc4',
          700: '#653ca8',
        },
        bg:   '#fbf7ff',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['"Hiragino Sans"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
