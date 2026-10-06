import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

// Class names are written out in full so Tailwind can find them
const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary border-primary',
  secondary: 'bg-transparent border-primary',
};

const FOREGROUND: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-primary',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      // The spinner hides the label visually, so screen readers still need it.
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      // min-h-11 is 44pt, Apple's minimum comfortable touch target
      className={clsx(
        'items-center, min-h-11 justify-center rounded-lg border px-5 active:opacity-80',
        CONTAINER[variant],
        disabled && 'opacity-40',
      )}
    >
      {/* The label stays rendered while loading, just invisible, so the
          button keeps its width instead of shrinking around the spinner. */}
      <Text
        className={clsx(
          'text-base font-semibold',
          FOREGROUND[variant],
          loading && 'opacity-0',
        )}
      >
        {label}
      </Text>
      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator
            className={FOREGROUND[variant]}
            testID="button-spinner"
          />
        </View>
      )}
    </Pressable>
  );
}
