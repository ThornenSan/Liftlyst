import { render, screen } from '@testing-library/react-native';

import { listExercises, type Exercise } from '../../db/exerciseRepository';
import { ExercisesSection } from '../ExercisesSection';

jest.mock('../../db/exerciseRepository', () => ({
  listExercises: jest.fn(),
  createExercise: jest.fn(),
}));

const list = jest.mocked(listExercises);

function exercise(name: string, syncStatus: Exercise['syncStatus']): Exercise {
  return {
    uuid: name,
    name,
    syncStatus,
    updatedAt: '2026-09-28T10:00:00.000Z',
  };
}

describe('ExercisesSection', () => {
  it('flags failed exercises in a banner and on the row', async () => {
    list.mockResolvedValue([
      exercise('Back Squat', 'failed'),
      exercise('Bench Press', 'synced'),
    ]);

    await render(<ExercisesSection />);

    expect(
      await screen.findByText("1 exercise couldn't be saved to your account."),
    ).toBeTruthy();
    expect(screen.getByText("Couldn't sync")).toBeTruthy();
  });

  it('hints at pending exercises and says nothing about synced ones', async () => {
    list.mockResolvedValue([
      exercise('Deadlift', 'pending'),
      exercise('Bench Press', 'synced'),
    ]);

    await render(<ExercisesSection />);

    expect(await screen.findByText('Waiting to sync')).toBeTruthy();
    expect(screen.queryByText("Couldn't sync")).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull(); // no banner
  });
});
