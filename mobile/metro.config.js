const { withStorybook } = require('@storybook/react-native/withStorybook');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = withStorybook(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    // Strips Storybook out of the bundle, so it can never end up
    // in a release build.
    enabled: process.env.STORYBOOK_ENABLED === 'true',
    liteMode: true,
  },
);
