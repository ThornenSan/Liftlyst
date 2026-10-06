const { withStorybook } = require('@storybook/react-native/withStorybook');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = withNativeWind(
  withStorybook(mergeConfig(getDefaultConfig(__dirname), config), {
    // Strips Storybook out of the bundle, so it can never end up
    // in a release build.
    enabled: process.env.STORYBOOK_ENABLED === 'true',
    liteMode: true,
  }),
  {
    input: './global.css',
    // NativeWind's native default is 14px, which shrinks every rem-based class
    // (min-h-11 → 38.5pt) and diverges from the web. 16 matches Tailwind's docs.
    inlineRem: 16,
  },
);
