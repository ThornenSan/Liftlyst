import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { onExercisesChanged } from '../db/exerciseEvents';
import {
  createExercise,
  listExercises,
  type Exercise,
} from '../db/exerciseRepository';
import type { SyncStatus } from '../db/types';
import { Button } from './Button';
import { clsx } from 'clsx';

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

const STATUS_CLASS: Record<SyncStatus, string> = {
  pending: 'text-muted',
  synced: 'text-success',
  failed: 'text-danger',
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
    <View className="mt-6 flex-1 gap-3 self-stretch">
      <Text className="text-xl font-semibold">Exercises</Text>

      {failedCount > 0 && (
        // Reanimated's Animated.View is not registered with NativeWind, so a
        // className on it would be ignored: it animates, the inner View styles.
        <Animated.View entering={FadeIn} accessibilityRole="alert">
          <View className="broder rounded-lg border-danger-border bg-danger-surface p-3">
            <Text className="text-danger-strong">
              {failedCount === 1 ? '1 exercise' : `${failedCount} exercises`}{' '}
              couldn't be saved to your account.
            </Text>
          </View>
        </Animated.View>
      )}

      <View className="flex-row gap-2">
        <TextInput
          className="flex-1 border border-border px-3 py-2.5 text-base"
          value={name}
          onChangeText={setName}
          onSubmitEditing={add}
          placeholder="e.g. Front Squat"
          accessibilityLabel="Exercise name"
          returnKeyType="done"
        />
        <Button label="Add" onPress={add} disabled={!canAdd} />
      </View>

      {error !== null && <Text className="text-danger">{error}</Text>}

      <FlatList
        data={exercises}
        keyExtractor={item => item.uuid}
        // Without this, the first tap on Add while the keyboard is open only
        // dismisses the keyboard.
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text className="mt-3 text-center opacity-60">No exercises yet</Text>
        }
        renderItem={({ item }) => {
          const label = STATUS_LABEL[item.syncStatus];
          return (
            <View className="border-b-hairline flex-row items-center justify-between border-b-divider py-3">
              <Text className="text-base">{item.name}</Text>
              {label !== null && (
                <Text
                  className={clsx(
                    'text-xs font-semibold',
                    STATUS_CLASS[item.syncStatus],
                  )}
                >
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
