import { composeStories } from '@storybook/react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { fn } from 'storybook/test';

import * as stories from '../Button.stories';

// The same four stories Storybook shows, rendered as ordinary components. If a
// story stops matching how the Button really behaves, these tests fail.
const { Primary, Secondary, Disabled, Loading } = composeStories(stories);

describe('Button', () => {
  it.each([
    ['Primary', Primary],
    ['Secondary', Secondary],
  ])('%s responds to a press', async (_name, Story) => {
    const onPress = fn();
    await render(<Story onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save workout' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses when disabled, and tells screen readers', async () => {
    const onPress = fn();
    await render(<Disabled onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Save workout' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('shows a spinner, ignores presses and reports itself busy while loading', async () => {
    const onPress = fn();
    await render(<Loading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Save workout' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
    expect(button.props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
  });
});
