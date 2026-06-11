import 'reflect-metadata';
import 'ts-node/register/transpile-only';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import appConfig from '../../src/lib/config/app.config';
import { DatabaseModule } from '../../src/lib/database.module';
import {
  assertTestDatabase,
  loadTestEnvironment,
  migrateTestDatabase,
} from './helpers/test-database';

type IntegrationGlobal = typeof globalThis & {
  __QUICKBITE_INTEGRATION_DB__?: Knex;
};

export default async function globalSetup(): Promise<void> {
  loadTestEnvironment();

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [appConfig],
      }),
      DatabaseModule,
    ],
  }).compile();
  const database = moduleRef.get<Knex>('KNEX_CONNECTION');

  try {
    await assertTestDatabase(database);
    await migrateTestDatabase(database);
    (globalThis as IntegrationGlobal).__QUICKBITE_INTEGRATION_DB__ = database;
  } catch (error) {
    await database.destroy();
    throw error;
  }
}
