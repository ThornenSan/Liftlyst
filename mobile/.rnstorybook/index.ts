import { AppRegistry } from 'react-native';
import { LiteUI } from '@storybook/react-native-ui-lite';

import { view } from './storybook.requires';
import { name as appName } from '../app.json';

/**
 * This file is user-editable.
 *
 * Use it as your React Native Storybook entrypoint and wrap `StorybookUIRoot`
 * with application decorators/providers (theme, i18n, state, navigation, etc).
 */
const StorybookUIRoot = view.getStorybookUI({
  // Remembering the last-opened story across reloads needs AsyncStorage, a
  // native module. Not worth adding one for a development convenience.
  shouldPersistSelection: false,
  CustomUIComponent: LiteUI,
});

AppRegistry.registerComponent(appName, () => StorybookUIRoot);

export default StorybookUIRoot;
