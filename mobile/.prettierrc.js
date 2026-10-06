module.exports = {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
  plugins: [require('prettier-plugin-tailwindcss')],
  // Also sort classes passed to clsx(), not just className="..."
  tailwindFunctions: ['clsx'],
};
