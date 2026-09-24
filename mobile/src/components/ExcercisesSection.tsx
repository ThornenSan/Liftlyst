import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createExercise,
  listExercises,
  type Exercise,
} from '../db/exerciseRepository';

export function ExercisesSection() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Bumped after each write so the effect re-reads from SQLite — the same
  // counter pattern HomeScreen uses for Retry.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Reads from the local database only. No network is involved, which is
    // exactly what Task 6.5 sets out to prove.
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
      setVersion(v => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save exercise');
    }
  }

  const canAdd = name.trim() !== '';

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Exercises</Text>

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
        <Pressable
          style={[styles.button, !canAdd && styles.buttonDisabled]}
          onPress={add}
          disabled={!canAdd}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      {error !== null && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={exercises}
        keyExtractor={item => item.uuid}
        // Without this, the first tap on Add while the keyboard is open only
        // dismisses the keyboard.
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No exercises yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={[styles.status, styles[item.syncStatus]]}>
              {item.syncStatus}
            </Text>
          </View>
        )}
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
  button: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
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
    textTransform: 'uppercase',
  },
  // Keyed by SyncStatus, so styles[item.syncStatus] picks the colour. Adding
  // a new status without a style here is a type error, not a silent default.
  pending: { color: '#b45309' },
  synced: { color: '#15803d' },
  failed: { color: '#b91c1c' },
});
