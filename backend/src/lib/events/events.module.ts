import { Global, Module } from '@nestjs/common';
import { MessageBrokerService } from './message-broker.service';
import { OutboxDrainService } from './outbox-drain.service';
import { OutboxRepository } from './outbox.repository';

/**
 * Global module so any service-layer call site can inject `OutboxRepository`
 * to write an outbox row in the same DB trx as a domain mutation.
 *
 * The outbox is drained by a separate worker process (see `src/worker.ts`).
 * The API process can still construct `OutboxDrainService` for ad-hoc tests.
 */
@Global()
@Module({
  providers: [MessageBrokerService, OutboxRepository, OutboxDrainService],
  exports: [MessageBrokerService, OutboxRepository, OutboxDrainService],
})
export class EventsModule {}
