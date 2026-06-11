import { Knex } from 'knex';

type IntegrationGlobal = typeof globalThis & {
  __QUICKBITE_INTEGRATION_DB__?: Knex;
};

export default async function globalTeardown(): Promise<void> {
  const integrationGlobal = globalThis as IntegrationGlobal;

  if (integrationGlobal.__QUICKBITE_INTEGRATION_DB__) {
    await integrationGlobal.__QUICKBITE_INTEGRATION_DB__.destroy();
    delete integrationGlobal.__QUICKBITE_INTEGRATION_DB__;
  }
}
