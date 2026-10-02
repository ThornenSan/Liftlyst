import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExercisesSection } from '../components/ExercisesSection';
import { Button } from '../components/Button';

import { ApiError, NetworkError } from '../api/client';
import { fetchHealth } from '../api/health';
import { API_BASE_URL } from '../config/env';

/**
 *
 */
type State =
  | { kind: 'loading' }
  | { kind: 'ok'; status: string }
  | { kind: 'error'; message: string; retryable: boolean };

export function HomeScreen() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  // Retry works by bumping this, which re-runs the effect below. That keeps
  // cancellation handled by React rather than by hand.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });

    fetchHealth()
      .then(response => {
        if (!cancelled) {
          setState({ kind: 'ok', status: response.status });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof NetworkError) {
          setState({
            kind: 'error',
            message: 'Cannot reach the server',
            retryable: true,
          });
        } else if (error instanceof ApiError) {
          setState({
            kind: 'error',
            message: `Server error (${error.status})`,
            retryable: error.status >= 500,
          });
        } else {
          setState({
            kind: 'error',
            message: 'Something went wrong',
            retryable: true,
          });
        }
      });

    // Runs on unmount and before each retry, so a late response cannot set
    // state on a screen that has gone away.
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text className="text-3xl font-bold text-primary">Liftlyst</Text>

        <Text style={styles.baseUrl}>{API_BASE_URL}</Text>

        {state.kind === 'loading' && <ActivityIndicator size="large" />}

        {state.kind === 'ok' && (
          <Text style={styles.ok}>API status: {state.status}</Text>
        )}

        {state.kind === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{state.message}</Text>
            {state.retryable && (
              <Button label="Retry" onPress={() => setAttempt(n => n + 1)} />
            )}
          </View>
        )}

        <ExercisesSection />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  baseUrl: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
  },
  ok: {
    fontSize: 18,
    color: '#15803d',
  },
  errorBox: {
    alignItems: 'center',
    gap: 12,
  },
  error: {
    fontSize: 16,
    color: '#b91c1c',
  },
});
