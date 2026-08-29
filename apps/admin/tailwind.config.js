/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cawaco: {
          navy: '#003B6F',
          primary: '#127AB5',
          teal: '#0E8E89',
          sand: '#C98B27',
          light: '#EBF5FB',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        heading: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
