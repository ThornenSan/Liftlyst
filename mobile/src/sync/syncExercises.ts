import { ApiError, NetworkError } from '../api/client';
import { pushExercise } from '../api/exercises';
import {
  listPendingExercises,
  markFailed,
  markSynced,
} from '../db/exerciseRepository';

export type SyncResult = {
  synced: number;
  failed: number;
  pending: number;
};

const RETRYABLE_CLIENT_ERRORS = new Set([408, 429]);

function isPermanentRejection(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    !RETRYABLE_CLIENT_ERRORS.has(error.status)
  );
}

let inFlight: Promise<SyncResult> | null = null;
let rerunRequested = false;

/**
 * Pushes every pending exercises to the server. A call made while a sync is
 * already running gets that sync's result instead of starting a second one.
 */
export function syncExercises(): Promise<SyncResult> {
  if (inFlight) {
    rerunRequested = true;
    return inFlight;
  }

  inFlight = (async () => {
    let result: SyncResult;
    do {
      rerunRequested = false;
      result = await run();
    } while (rerunRequested);

    return result;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

async function run(): Promise<SyncResult> {
  const pending = await listPendingExercises();
  const result: SyncResult = { synced: 0, failed: 0, pending: 0 };

  // One at a time, oldest first: records reach the server in the order they
  // were made, and the first network failure can stop the whole batch.
  for (let i = 0; i < pending.length; i++) {
    const exercise = pending[i];

    try {
      await pushExercise({ uuid: exercise.uuid, name: exercise.name });

      await markSynced(exercise.uuid);
      result.synced++;
    } catch (error) {
      if (isPermanentRejection(error)) {
        await markFailed(exercise.uuid);
        result.failed++;
      } else if (error instanceof NetworkError) {
        // Offline. so leave them off pending and stop
        result.pending += pending.length - i;
        break;
      } else {
        // 5xx, 408, 428 or anything unexpected: leave pending, try the next.
        result.pending++;
      }
    }
  }

  return result;
}
