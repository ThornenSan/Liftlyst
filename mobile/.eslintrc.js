module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // The shared config only enables Jest globals for *.test.* files and
      // __tests__/ directories, which setup files do not match.
      files: ['jest.setup.js'],
      env: { jest: true },
    },
  ],
};
