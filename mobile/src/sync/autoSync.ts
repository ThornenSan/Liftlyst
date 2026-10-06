import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

import { onExercisesChanged } from '../db/exerciseEvents';
import { syncExercises } from './syncExercises';

let offline = false;

function requestSync(): void {
  if (offline) {
    return;
  }

  syncExercises().catch(() => {});
}

/**
 * Keeps local exercises in sync with the server while the app is open. Call
 * once at startup; returns a function that stops it.
 */
export function startAutoSync(): () => void {
  const stopNetInfo = NetInfo.addEventListener(state => {
    const wasOffline = offline;
    offline = state.isConnected === false;

    // Example walking out of basement: push everything
    if (wasOffline && !offline) {
      requestSync();
    }
  });

  // App returns to foreground
  const appState = AppState.addEventListener('change', state => {
    if (state === 'active') {
      requestSync();
    }
  });

  const stopChanges = onExercisesChanged(change => {
    if (change === 'created') {
      requestSync();
    }
  });

  requestSync();

  return () => {
    stopNetInfo();
    appState.remove();
    stopChanges();
  };
}
