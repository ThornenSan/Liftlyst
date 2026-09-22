// react-native-config reads values injected by the native build. There is no
// native side under Jest, so importing it throws. An empty object means
// src/config/env.ts falls through to its per-platform default.
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));

// The shipped safe-area mock covers the provider, contexts and hook, but not
// SafeAreaView. A plain View is a faithful stand-in — there are no real insets
// in a test environment anyway.
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  const { View } = require('react-native');

  return { ...mock, SafeAreaView: View };
});
