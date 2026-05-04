import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { MessageBrokerService } from './message-broker.service';
import { OutboxRepository } from './outbox.repository';

/**
 * One pass over events_outbox: claim a batch with FOR UPDATE SKIP LOCKED,
 * publish each row to the exchange with publisher confirms, mark dispatched.
 * On publish failure: mark the row failed (attempts+1) and bail out of the
 * batch — the broker is probably sick, no point hammering it.
 *
 * SKIP LOCKED makes N drainers safe to run in parallel.
 */
@Injectable()
export class OutboxDrainService {
  private readonly logger = new Logger(OutboxDrainService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly outboxRepo: OutboxRepository,
    private readonly broker: MessageBrokerService,
    private readonly configService: ConfigService,
  ) {}

  async drain(): Promise<{ moved: number }> {
    try {
      await this.broker.ensureConnected();
    } catch (err) {
      this.logger.warn(
        `broker unavailable, skipping drain: ${(err as Error).message}`,
      );
      return { moved: 0 };
    }

    const batchSize = this.configService.get<number>('rabbit.batchSize') ?? 50;
    const trx = await this.knex.transaction();

    try {
      const rows = await this.outboxRepo.claimBatch(trx, batchSize);
      if (rows.length === 0) {
        await trx.commit();
        return { moved: 0 };
      }

      // 1. Create arrays to track successes and failures!
      const successfulIds: string[] = [];
      let failedRowId: string | null = null;
      let failedMsg: string = '';

      for (const row of rows) {
        const envelope = {
          eventId: row.event_id,
          eventType: row.event_type,
          occurredAt: new Date().toISOString(),
          aggregateType: row.aggregate_type,
          aggregateId: row.aggregate_id,
          payload: row.payload,
        };

        try {
          await this.broker.publish(
            row.event_type,
            Buffer.from(JSON.stringify(envelope), 'utf8'),
          );

          // 2. DO NOT update the DB here. Just save the ID!
          successfulIds.push(row.id);
        } catch (err) {
          // RabbitMQ crashed! Stop the loop immediately.
          failedMsg = describeError(err);
          failedRowId = row.id;
          this.logger.error(
            `outbox publish failed (id=${row.id}): ${failedMsg}`,
          );
          break;
        }
      }

      // 3. THE BULK UPDATES (The massive performance boost)
      if (successfulIds.length > 0) {
        await this.outboxRepo.markDispatchedBulk(trx, successfulIds);
      }

      if (failedRowId) {
        await this.outboxRepo.markFailed(trx, failedRowId, failedMsg);
      }

      await trx.commit();
      return { moved: successfulIds.length };
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }
}

function describeError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object' && 'errors' in err) {
    const inner = (err as { errors: unknown[] }).errors;
    if (Array.isArray(inner) && inner.length > 0) {
      return inner.map(describeError).filter(Boolean).join('; ');
    }
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
