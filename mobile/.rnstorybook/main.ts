import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  // Stories sit next to the component they document, not inside .rnstorybook.
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  deviceAddons: ['@storybook/addon-ondevice-actions'],
};

export default main;
