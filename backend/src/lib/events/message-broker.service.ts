import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQClient } from '../../pkg/messaging/rabbitmq.client';

/**
 * Nest wrapper around the framework-agnostic RabbitMQClient. Single shared
 * connection per process. Connect on boot, close on shutdown.
 *
 * Boot is best-effort: a broker outage at startup must not crash the API. The
 * outbox drain retries on every tick, so once Rabbit is back, drains catch up.
 */
@Injectable()
export class MessageBrokerService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(MessageBrokerService.name);
  private readonly client: RabbitMQClient;
  private readonly exchange: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('rabbit.url');
    if (!url) {
      throw new Error('rabbit.url is not configured (set RABBITMQ_URL)');
    }
    this.client = new RabbitMQClient({ url });
    this.exchange = this.configService.get<string>('rabbit.exchange') ?? 'core.events';
  }

  async onModuleInit() {
    try {
      await withTimeout(
        (async () => {
          await this.client.connect();
          await this.client.declareExchange(this.exchange);
        })(),
        5_000,
        'RabbitMQ connect',
      );
      this.logger.log(`Connected to RabbitMQ; exchange "${this.exchange}" declared.`);
    } catch (err) {
      this.logger.warn(
        `RabbitMQ unreachable at boot — drains will retry. ${(err as Error).message}`,
      );
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Closing RabbitMQ connection (${signal ?? 'shutdown'})…`);
    await this.client.close();
  }

  async ensureConnected(): Promise<void> {
    await this.client.connect();
    await this.client.declareExchange(this.exchange);
  }

  async publish(routingKey: string, body: Buffer): Promise<void> {
    await this.client.publishConfirmed(this.exchange, routingKey, body);
  }
}

/**
 * Race a promise against a timeout. amqp-connection-manager retries forever
 * by design, so `await client.connect()` never rejects when the broker is
 * down. We bound it here so the API can boot best-effort without a broker.
 */
async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
