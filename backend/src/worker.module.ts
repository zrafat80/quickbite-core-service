import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './lib/config/app.config';
import { DatabaseModule } from './lib/database.module';
import { EventsModule } from './lib/events/events.module';

/**
 * Minimal module for the outbox worker process. No HTTP, no controllers, no
 * scheduling here — `src/worker.ts` orchestrates the cron loop directly.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    DatabaseModule,
    EventsModule,
  ],
})
export class WorkerModule {}
