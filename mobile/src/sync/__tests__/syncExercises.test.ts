import { ApiError, NetworkError } from '../../api/client';
import { pushExercise } from '../../api/exercises';
import {
  listPendingExercises,
  markFailed,
  markSynced,
  type Exercise,
} from '../../db/exerciseRepository';
import { syncExercises } from '../syncExercises';

jest.mock('../../api/exercises', () => ({ pushExercise: jest.fn() }));
jest.mock('../../db/exerciseRepository', () => {
  const mock: Partial<typeof import('../../db/exerciseRepository')> = {
    listPendingExercises: jest.fn(),
    markSynced: jest.fn(),
    markFailed: jest.fn(),
  };
  return mock;
});

const push = jest.mocked(pushExercise);
const listPending = jest.mocked(listPendingExercises);
const synced = jest.mocked(markSynced);
const failed = jest.mocked(markFailed);

function exercise(uuid: string): Exercise {
  return {
    uuid,
    name: `Exercise ${uuid}`,
    syncStatus: 'pending',
    updatedAt: '2026-09-25T10:00:00.000Z',
  };
}

const flush = () =>
  new Promise<void>(resolve => setTimeout(() => resolve(), 0));

beforeEach(() => {
  jest.resetAllMocks();
  synced.mockResolvedValue();
  failed.mockResolvedValue;
});

describe('syncExercises', () => {
  it('marks every exercise synced when the server accepts it', async () => {
    listPending.mockResolvedValue([exercise('a'), exercise('b')]);
    push.mockResolvedValue();

    await expect(syncExercises()).resolves.toEqual({
      synced: 2,
      failed: 0,
      pending: 0,
    });
    // Oldest first, as listPendingExercises returned them.
    expect(push).toHaveBeenNthCalledWith(1, { uuid: 'a', name: 'Exercise a' });
    expect(push).toHaveBeenNthCalledWith(2, { uuid: 'b', name: 'Exercise b' });
    expect(synced).toHaveBeenCalledWith('a');
    expect(synced).toHaveBeenCalledWith('b');
  });

  it('marks a validation rejection as failed and carries on', async () => {
    listPending.mockResolvedValue([exercise('a'), exercise('b')]);
    push
      .mockRejectedValueOnce(new ApiError('Invalid', 422, null))
      .mockResolvedValue();

    await expect(syncExercises()).resolves.toEqual({
      synced: 1,
      failed: 1,
      pending: 0,
    });
    expect(failed).toHaveBeenCalledWith('a');
    expect(synced).toHaveBeenCalledWith('b');
  });

  it('leaves a server error pending and carries on', async () => {
    listPending.mockResolvedValue([exercise('a'), exercise('b')]);
    push
      .mockRejectedValueOnce(new ApiError('Unvailable', 503, null))
      .mockResolvedValueOnce();

    await expect(syncExercises()).resolves.toEqual({
      synced: 1,
      failed: 0,
      pending: 1,
    });
    expect(failed).not.toHaveBeenCalled();
    expect(synced).not.toHaveBeenCalledWith('a');
  });

  it.each([408, 429])(
    'treat %i as "try again later", not a permanent rejection',
    async status => {
      listPending.mockResolvedValue([exercise('a')]);
      push.mockRejectedValueOnce(new ApiError('Later', status, null));

      await expect(syncExercises()).resolves.toEqual({
        synced: 0,
        failed: 0,
        pending: 1,
      });
      expect(failed).not.toHaveBeenCalled();
    },
  );

  it('stops at the first network failure and keeps everything pending', async () => {
    listPending.mockResolvedValue([
      exercise('a'),
      exercise('b'),
      exercise('c'),
    ]);
    push.mockRejectedValueOnce(new NetworkError('offline'));

    await expect(syncExercises()).resolves.toEqual({
      synced: 0,
      failed: 0,
      pending: 3,
    });
    // b and c were never attempted: each would have waited out a full timeout.
    expect(push).toHaveBeenCalledTimes(1);
    expect(synced).not.toHaveBeenCalled();
    expect(failed).not.toHaveBeenCalled();
  });

  it('runs again when asked mid-sync, instead of starting a parallel run', async () => {
    let finishFirstPush!: () => void;

    listPending
      .mockResolvedValueOnce([exercise('a')])
      // A record created while the first pass was running.
      .mockResolvedValueOnce([exercise('b')]);
    push
      .mockImplementationOnce(
        () => new Promise<void>(resolve => (finishFirstPush = resolve)),
      )
      .mockResolvedValueOnce();

    const first = syncExercises();
    await flush();
    const second = syncExercises();

    // Same promise: the second call joined the running sync.
    expect(second).toBe(first);

    finishFirstPush();
    await first;

    // Two passes, one after the other, so 'b' was not missed.
    expect(listPending).toHaveBeenCalledTimes(2);
    expect(synced).toHaveBeenCalledWith('a');
    expect(synced).toHaveBeenCalledWith('b');
  });
});
