import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import { InsertOutboxInput, OutboxRow } from './events.types';

@Injectable()
export class OutboxRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  /**
   * Insert an outbox row in the SAME trx as the domain mutation that produced
   * it. Caller passes its trx. No dispatch happens here — the drain worker
   * picks up undispatched rows on its own cadence.
   */
  async insertOutboxEvent(
    trx: Knex.Transaction,
    input: InsertOutboxInput,
  ): Promise<void> {
    await trx('events_outbox').insert({
      aggregate_type: input.aggregateType,
      aggregate_id: String(input.aggregateId),
      event_type: input.eventType,
      event_id: randomUUID(),
      payload: JSON.stringify(input.payload),
    });
  }

  /**
   * Bulk variant — single multi-row INSERT for N events. Use this whenever a
   * caller would otherwise loop over `insertOutboxEvent` (e.g. one event per
   * order item). No-op on empty input.
   */
  async insertOutboxEvents(
    trx: Knex.Transaction,
    inputs: InsertOutboxInput[],
  ): Promise<void> {
    if (inputs.length === 0) return;
    await trx('events_outbox').insert(
      inputs.map((input) => ({
        aggregate_type: input.aggregateType,
        aggregate_id: String(input.aggregateId),
        event_type: input.eventType,
        event_id: randomUUID(),
        payload: JSON.stringify(input.payload),
      })),
    );
  }

  /**
   * Dispatcher claim — selects a batch of undispatched rows and locks them so
   * another dispatcher process won't pick up the same rows. Caller is
   * responsible for committing/rolling back the trx.
   */
  async claimBatch(trx: Knex.Transaction, limit: number): Promise<OutboxRow[]> {
    const rows = await trx('events_outbox')
      .select(
        'id',
        'aggregate_type',
        'aggregate_id',
        'event_type',
        'event_id',
        'payload',
        'attempts',
      )
      .whereNull('dispatched_at')
      .orderBy('id', 'asc')
      .limit(limit)
      .forUpdate()
      .skipLocked();
    return rows as OutboxRow[];
  }

  async markDispatched(trx: Knex.Transaction, id: string): Promise<void> {
    await trx('events_outbox')
      .where({ id })
      .update({ dispatched_at: new Date() });
  }

  async markFailed(
    trx: Knex.Transaction,
    id: string,
    err: string ,
  ): Promise<void> {
    await trx('events_outbox')
      .where({ id })
      .update({
        attempts: this.knex.raw('attempts + 1'),
        last_error: err.slice(0, 2000),
      });
  }
  async markDispatchedBulk(
    trx: Knex.Transaction,
    ids: string[],
  ): Promise<void> {
    await trx('events_outbox').whereIn('id', ids).update({
      dispatched_at: new Date(),
    });
  }
}
