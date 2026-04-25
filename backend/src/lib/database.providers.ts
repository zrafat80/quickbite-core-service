import knex from 'knex';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'KNEX_CONNECTION',
    inject: [ConfigService], 
    useFactory: async (configService: ConfigService) => {
      
      const isTestEnv = 
        configService.get<string>('environment') === 'test' || process.env.JEST_WORKER_ID;
      
      const dbType = isTestEnv ? 'testDatabase' : 'database';

      const knexInstance = knex({
        client: 'pg',
        connection: {
          host: configService.get<string>(`${dbType}.host`),
          port: configService.get<number>(`${dbType}.port`),
          user: configService.get<string>(`${dbType}.username`),
          password: configService.get<string>(`${dbType}.password`),
          database: configService.get<string>(`${dbType}.name`),
        },
        pool: {
          min: configService.get<number>('database.poolMin'),
          max: configService.get<number>('database.poolMax'),
        },
      });

      try {
        await knexInstance.raw('SELECT 1');
        console.log(`✅ PostgreSQL connected successfully to [${configService.get<string>(`${dbType}.name`)}]`);
      } catch (error) {
        console.error('❌ Database connection failed', error);
        throw error;
      }

      return knexInstance;
    },
  },
];