/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Agency dark palette.
        ink: {
          900: '#0b0f17',
          800: '#111725',
          700: '#182033',
          600: '#212c44',
        },
        brand: {
          400: '#6ea8fe',
          500: '#4f8cff',
          600: '#3b6fe0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
