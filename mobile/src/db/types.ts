export type SyncStatus = 'pending' | 'synced' | 'failed';

export type ExerciseRow = {
  uuid: string;
  name: string;
  sync_status: SyncStatus;
  updated_at: string;
};
