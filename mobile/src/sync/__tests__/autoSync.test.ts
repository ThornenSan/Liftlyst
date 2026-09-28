import { notifyExercisesChanged } from '../../db/exerciseEvents';
import { startAutoSync } from '../autoSync';
import { syncExercises } from '../syncExercises';

jest.mock('../syncExercises', () => ({
  syncExercises: jest
    .fn()
    .mockResolvedValue({ synced: 0, failed: 0, pending: 0 }),
}));

const sync = jest.mocked(syncExercises);

it('syncs when an exercise is created, but not when one is marked synced', () => {
  const stop = startAutoSync();
  sync.mockClear(); // ignore the sync startAutoSync runs straight away

  // If this triggered a sync, every markSynced would cause another sync.
  notifyExercisesChanged('synced');
  notifyExercisesChanged('failed');
  expect(sync).not.toHaveBeenCalled();

  notifyExercisesChanged('created');
  expect(sync).toHaveBeenCalledTimes(1);

  stop();
});
