import { config } from 'dotenv';
import { Knex } from 'knex';
import path from 'path';

const MIGRATION_TABLES = ['knex_migrations', 'knex_migrations_lock'];
const TEST_ENV_PATH = path.resolve(process.cwd(), '.env.test');
const MIGRATIONS_PATH = path.resolve(
  process.cwd(),
  'src',
  'database',
  'migrations',
);

export function loadTestEnvironment(): void {
  const result = config({ path: TEST_ENV_PATH, override: true });

  if (result.error) {
    throw new Error(`Unable to load test environment at ${TEST_ENV_PATH}`);
  }
}

export async function assertTestDatabase(database: Knex): Promise<void> {
  const result = await database.raw<{ rows: Array<{ database_name: string }> }>(
    'SELECT current_database() AS database_name',
  );
  const databaseName = result.rows[0]?.database_name;

  if (process.env.NODE_ENV !== 'test' || !databaseName?.includes('test')) {
    throw new Error(
      `Refusing to use unsafe integration database "${databaseName || ''}"`,
    );
  }
}

export async function migrateTestDatabase(database: Knex): Promise<void> {
  await database.migrate.latest({
    directory: MIGRATIONS_PATH,
    loadExtensions: ['.ts'],
  });
}

export async function truncateAllTables(database: Knex): Promise<void> {
  await assertTestDatabase(database);

  const result = await database.raw<{ rows: Array<{ table_name: string }> }>(
    `
    SELECT c.relname AS table_name
    FROM pg_class AS c
    INNER JOIN pg_namespace AS n ON n.oid = c.relnamespace
    LEFT JOIN pg_depend AS d
      ON d.objid = c.oid
      AND d.deptype = 'e'
    WHERE n.nspname = current_schema()
      AND c.relkind = 'r'
      AND d.objid IS NULL
      AND c.relname NOT IN (?, ?)
    ORDER BY c.relname
  `,
    MIGRATION_TABLES,
  );

  const tableNames = result.rows.map((row) => row.table_name);
  if (tableNames.length === 0) {
    return;
  }

  await database.raw('TRUNCATE TABLE ?? RESTART IDENTITY CASCADE', [
    tableNames,
  ]);
}
