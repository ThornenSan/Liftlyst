module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // Transform every react-native-* package, not just react-native itself.
    // Many ship untranspiled ES modules or TypeScript — safe-area-context
    // 5.8's Jest mock is raw .tsx — and uuid is ES-modules-only.
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|uuid)/)',
  ],
};
