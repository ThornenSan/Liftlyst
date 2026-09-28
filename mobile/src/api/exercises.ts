import { post } from './client';

export type ExercisePayload = {
  uuid: string;
  name: string;
};

export async function pushExercise(payload: ExercisePayload): Promise<void> {
  await post<unknown>('/exercises', payload);
}
