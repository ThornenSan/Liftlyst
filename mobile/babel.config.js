module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must stay LAST in this list. It rewrites functions marked as worklets so
  // they can run on the UI thread, and nothing may transform them afterwards.
  plugins: ['react-native-worklets/plugin'],
};
