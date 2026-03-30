import { Injectable, Inject, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    // Inject the Knex connection we created in your provider
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  // NestJS automatically runs this function when the server is closing
  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Received ${signal}. Gracefully shutting down database pool...`);
    
    try {
      // knex.destroy() safely drains and closes all active PostgreSQL connections
      await this.knex.destroy();
      this.logger.log('✅ Database connection pool closed successfully.');
    } catch (error) {
      this.logger.error('❌ Error while closing database connection', error);
    }
  }
}