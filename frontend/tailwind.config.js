/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
      },
      colors: {
        f1red: '#EE3F2C',
        'f1red-dark': '#C5321F',
        'f1red-light': '#FF6B5A',
      },
    },
  },
  plugins: [],
}
