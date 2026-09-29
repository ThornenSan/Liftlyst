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

jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// Gesture Handler ships its own Jest setup, which mocks its native module.
require('react-native-gesture-handler/jestSetup');

// With the resolver in jest.config.js, the real Reanimated runs on its
// JavaScript implementation. setUpTests adds its testing helpers.
require('react-native-reanimated').setUpTests();
