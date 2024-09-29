// tailwind.config.js

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Changed from purge to content
  darkMode: 'media', // Changed from false to 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'primary-bg': '#1a1a1a',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
