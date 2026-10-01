module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    // Must be LAST here, which makes it run FIRST: Babel applies presets in
    // reverse order. It turns JSX into NativeWind's runtime before the React
    // Native preset can. It also applies Reanimated's Babel plugin (which
    // forwards to Worklets), so that plugin is no longer listed separately.
    'nativewind/babel',
  ],
};
