const { colors } = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind only generates classes it can find written out in these files.
  content: ['./App.tsx', './src/**/*.{ts,tsx}', './.rnstorybook/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: { colors },
  },
  plugins: [],
};
