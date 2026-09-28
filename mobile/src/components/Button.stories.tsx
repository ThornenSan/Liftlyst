import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { fn } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    Story => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  // fn() records each press, which shows up in the Actions panel.
  args: { label: 'Save workout', onPress: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};

const styles = StyleSheet.create({
  canvas: {
    padding: 16,
    alignItems: 'flex-start',
  },
});
