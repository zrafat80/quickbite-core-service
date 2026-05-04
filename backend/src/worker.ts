import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Cron } from 'croner';
import { OutboxDrainService } from './lib/events/outbox-drain.service';
import { WorkerModule } from './worker.module';

/**
 * Outbox worker — runs independently of the HTTP server.
 *
 * API instances write to `events_outbox` in the same trx as their domain
 * mutation. This worker process polls that table on a cron schedule and
 * publishes pending rows with publisher confirms. Scales horizontally:
 * `OutboxRepository.claimBatch` uses FOR UPDATE SKIP LOCKED so N workers can
 * run in parallel without duplicate publishes.
 */
async function bootstrap() {
  const logger = new Logger('Worker');
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'warn', 'error'],
  });
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const drain = app.get(OutboxDrainService);

  const pattern = configService.get<string>('rabbit.drainCron') ?? '* * * * * *';
  const batchSize = configService.get<number>('rabbit.batchSize') ?? 50;

  const job = new Cron(pattern, { protect: true }, async () => {
    try {
      const { moved } = await drain.drain();
      if (moved > 0) {
        logger.log(`outbox drain: moved=${moved}`);
      }
    } catch (err) {
      logger.error(`outbox drain error: ${(err as Error).message}`);
    }
  });
  logger.log(`outbox drain scheduled (cron="${pattern}", batchSize=${batchSize})`);

  const shutdown = async (signal: string) => {
    logger.log(`worker: ${signal} received, stopping…`);
    job.stop();
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('worker fatal:', err);
  process.exit(1);
});
