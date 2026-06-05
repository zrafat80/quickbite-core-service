import amqp from 'amqp-connection-manager';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { ConfirmChannel } from 'amqplib';
import type { IMessageBroker } from './message-broker.interface';

export interface RabbitMQConfig {
  url: string;
  reconnectInitialMs?: number;
}

/**
 * Producer-side wrapper built on amqp-connection-manager. The library handles
 * auto-reconnect, channel re-creation, and buffering publishes while
 * disconnected. ConfirmChannel ensures publish() resolves only on broker ACK.
 */
export class RabbitMQClient implements IMessageBroker {
  private connection: AmqpConnectionManager | null = null;
  private channel: ChannelWrapper | null = null;
  private readonly declaredExchanges = new Set<string>();

  constructor(private readonly config: RabbitMQConfig) {}

  async connect(): Promise<void> {
    if (this.connection) return;
    const reconnectSec = Math.max(
      1,
      Math.round((this.config.reconnectInitialMs ?? 500) / 1000),
    );
    this.connection = amqp.connect([this.config.url], {
      reconnectTimeInSeconds: reconnectSec,
    });
    this.channel = this.connection.createChannel({ json: false });
    await this.channel.waitForConnect();
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
    } catch {}
    try {
      if (this.connection) await this.connection.close();
    } catch {}
    this.channel = null;
    this.connection = null;
  }

  async declareExchange(
    exchange: string,
    opts?: { alternateExchange?: string; alternateQueue?: string },
  ): Promise<void> {
    const declarationKey = JSON.stringify({
      exchange,
      alternateExchange: opts?.alternateExchange ?? null,
      alternateQueue: opts?.alternateQueue ?? null,
    });
    if (this.declaredExchanges.has(declarationKey)) return;

    if (!this.channel) await this.connect();
    await this.channel!.addSetup(async (ch: ConfirmChannel) => {
      if (opts?.alternateExchange && opts.alternateQueue) {
        await ch.assertExchange(opts.alternateExchange, 'fanout', {
          durable: true,
        });
        await ch.assertQueue(opts.alternateQueue, { durable: true });
        await ch.bindQueue(opts.alternateQueue, opts.alternateExchange, '');
      }

      await ch.assertExchange(exchange, 'topic', {
        durable: true,
        arguments: opts?.alternateExchange
          ? { 'alternate-exchange': opts.alternateExchange }
          : undefined,
      });
    });
    this.declaredExchanges.add(declarationKey);
  }

  async publishConfirmed(
    exchange: string,
    routingKey: string,
    body: Buffer,
  ): Promise<void> {
    if (!this.channel) await this.connect();
    await this.channel!.publish(exchange, routingKey, body, {
      persistent: true,
      contentType: 'application/json',
    });
  }
}
