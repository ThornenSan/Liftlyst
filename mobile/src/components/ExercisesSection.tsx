import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { onExercisesChanged } from '../db/exerciseEvents';
import {
  createExercise,
  listExercises,
  type Exercise,
} from '../db/exerciseRepository';
import type { SyncStatus } from '../db/types';
import { Button } from './Button';

/**
 * Synced records say nothing: sync is meant to be invisible when it works.
 * Keyed by SyncStatus, so adding a status without deciding how to show it is
 * a type error.
 */
const STATUS_LABEL: Record<SyncStatus, string | null> = {
  pending: 'Waiting to sync',
  synced: null,
  failed: "Couldn't sync",
};

export function ExercisesSection() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // Re-read after any write, from anywhere — including autoSync marking
  // records synced in the background.
  useEffect(() => onExercisesChanged(() => setVersion(v => v + 1)), []);

  useEffect(() => {
    let cancelled = false;

    // Local database only — no network involved
    listExercises()
      .then(rows => {
        if (!cancelled) {
          setExercises(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load exercises');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  async function add() {
    try {
      await createExercise(name);
      setName('');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save exercise');
    }
  }

  const canAdd = name.trim() !== '';
  const failedCount = exercises.filter(e => e.syncStatus === 'failed').length;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Exercises</Text>

      {failedCount > 0 && (
        <Animated.View
          entering={FadeIn}
          style={styles.banner}
          accessibilityRole="alert"
        >
          <Text style={styles.bannerText}>
            {failedCount === 1 ? '1 exercise' : `${failedCount} exercises`}{' '}
            couldn't be saved to your account.
          </Text>
        </Animated.View>
      )}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          onSubmitEditing={add}
          placeholder="e.g. Front Squat"
          accessibilityLabel="Exercise name"
          returnKeyType="done"
        />
        <Button label="Add" onPress={add} disabled={!canAdd} />
      </View>

      {error !== null && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={exercises}
        keyExtractor={item => item.uuid}
        // Without this, the first tap on Add while the keyboard is open only
        // dismisses the keyboard.
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No exercises yet</Text>}
        renderItem={({ item }) => {
          const label = STATUS_LABEL[item.syncStatus];
          return (
            <View style={styles.item}>
              <Text style={styles.itemName}>{item.name}</Text>
              {label !== null && (
                <Text style={[styles.status, styles[item.syncStatus]]}>
                  {label}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignSelf: 'stretch',
    flex: 1,
    gap: 12,
    marginTop: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  banner: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  bannerText: {
    color: '#991b1b',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#b91c1c',
  },
  empty: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 16,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  pending: { color: '#9ca3af' },
  synced: { color: '#15803d' },
  failed: { color: '#b91c1c' },
});
