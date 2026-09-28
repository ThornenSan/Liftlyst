/**
 * Emitted by the repository after every write. Screens use it to re-read;
 * autoSync uses 'created' to push new records straight away.
 *
 * The reson is part of the event so autoSync can ignore 'synced' and 'failed'
 */

export type ExerciseChange = 'created' | 'synced' | 'failed';

type Listener = (change: ExerciseChange) => void;

const listeners = new Set<Listener>();

/** Returns an unsubscribe function, so it drops straigth into a useEffect. */
export function onExercisesChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyExercisesChanged(change: ExerciseChange): void {
  listeners.forEach(listener => listener(change));
}
