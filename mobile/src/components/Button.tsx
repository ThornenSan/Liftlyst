import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const inactive = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      // The spinner hides the label visually, so screen readers still need it.
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !inactive && styles.pressed,
      ]}
    >
      {/* The label stays rendered while loading, just invisible, so the
          button keeps its width instead of shrinking around the spinner. */}
      <Text
        style={[
          styles.label,
          isPrimary ? styles.primaryLabel : styles.secondaryLabel,
          loading && styles.hidden,
        ]}
      >
        {label}
      </Text>
      {loading && (
        <View style={styles.spinner}>
          <ActivityIndicator
            color={isPrimary ? '#ffffff' : '#1f2937'}
            testID="button-spinner"
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44, // Apple's minimum comfortable touch target
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: '#1f2937',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#ffffff',
  },
  secondaryLabel: {
    color: '#1f2937',
  },
  hidden: {
    opacity: 0,
  },
  spinner: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
