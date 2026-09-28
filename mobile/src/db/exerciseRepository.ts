import { v4 as uuidv4 } from 'uuid';

import { getDatabase } from './index';
import type { ExerciseRow, SyncStatus } from './types';
import { notifyExercisesChanged } from './exerciseEvents';

export type Exercise = {
  uuid: string;
  name: string;
  syncStatus: SyncStatus;
  updatedAt: string;
};

function toExercise(row: ExerciseRow): Exercise {
  return {
    uuid: row.uuid,
    name: row.name,
    syncStatus: row.sync_status,
    updatedAt: row.updated_at,
  };
}

/**
 * op-sqlite types rows as Record<string, Scaler>.
 */
function toExercises(rows: unknown[]): Exercise[] {
  return (rows as ExerciseRow[]).map(toExercise);
}

export async function listExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const result = await db.execute(
    'SELECT uuid, name, sync_status, updated_at FROM exercises ORDER by name',
  );

  return toExercises(result.rows);
}

/**
 * Saves locally and returns immediately. No network is involved: the record
 * starts as 'pending' and the sync layer pushes it whenever it next can.
 */
export async function createExercise(name: string): Promise<Exercise> {
  const trimmed = name.trim();
  if (trimmed === '') {
    throw new Error('Exercise name is required');
  }

  const exercise: Exercise = {
    uuid: uuidv4(),
    name: trimmed,
    syncStatus: 'pending',
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.execute(
    'INSERT INTO exercises (uuid, name, sync_status, updated_at) VALUES (?, ?, ?, ?)',
    [exercise.uuid, exercise.name, exercise.syncStatus, exercise.updatedAt],
  );

  notifyExercisesChanged('created');

  return exercise;
}

export async function listPendingExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const result = await db.execute(
    'SELECT uuid, name, sync_status, updated_at FROM exercises WHERE sync_status = ? ORDER BY updated_at',
    ['pending'],
  );

  return toExercises(result.rows);
}

export async function markSynced(uuid: string): Promise<void> {
  const db = await getDatabase();
  await db.execute('UPDATE exercises SET sync_status = ? WHERE uuid = ?', [
    'synced',
    uuid,
  ]);
  notifyExercisesChanged('synced');
}

export async function markFailed(uuid: string): Promise<void> {
  const db = await getDatabase();
  await db.execute('UPDATE exercises SET sync_status = ? WHERE uuid = ?', [
    'failed',
    uuid,
  ]);
  notifyExercisesChanged('failed');
}
