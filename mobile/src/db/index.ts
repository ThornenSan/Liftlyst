import { open, type DB } from '@op-engineering/op-sqlite';

import { migrate } from './migrations';

let dbPromise: Promise<DB> | null = null;

export function getDatabase(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = open({ name: 'liftlyst.db' });
      await migrate(database);
      return database;
    })();
  }

  return dbPromise;
}
