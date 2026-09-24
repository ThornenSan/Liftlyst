import type { DB } from '@op-engineering/op-sqlite';

const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE IF NOT EXISTS exercises (
      uuid TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      updated_at TEXT NOT NULL
      );`,
    `CREATE INDEX IF NOT EXISTS idx_exercises_sync_status
        ON exercises (sync_status);`,
  ],
];

export async function migrate(db: DB): Promise<void> {
  const result = await db.execute('PRAGMA user_version;');
  const current = Number(result.rows[0]?.user_version ?? 0);

  for (let version = current; version < MIGRATIONS.length; version++) {
    for (const statement of MIGRATIONS[version]) {
      await db.execute(statement);
    }
    // PRAGMA cannot take a bound parameter, so this is interpolated. Safe
    // here because `version` is a loop index, never user input.
    await db.execute(`PRAGMA user_version = ${version + 1}`);
  }
}
