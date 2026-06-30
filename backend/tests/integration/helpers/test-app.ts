import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { Knex } from 'knex';
import { AppModule } from 'src/app.module';
import { EMAIL_PROVIDER_TOKEN } from 'src/lib/email/email.constants';
import { MessageBrokerService } from 'src/lib/events/message-broker.service';
import { DatabaseErrorFilter } from 'src/lib/filters/database-error.filter';
import { S3_CLIENT } from 'src/lib/s3/s3.constants';
import type { S3ObjectMetadata } from 'src/pkg/s3/s3.interface';
import { EmailStub } from './email.stub';
import { assertTestDatabase, truncateAllTables } from './test-database';

export function useCoreIntegrationApp() {
  const cache = new Map<string, unknown>();
  const cacheManager = {
    async get(key: string) {
      return cache.get(key);
    },
    async set(key: string, value: unknown) {
      cache.set(key, value);
    },
    async del(key: string) {
      cache.delete(key);
    },
  };
  const emailStub = new EmailStub();
  const messageBrokerStub = {
    published: [] as Array<{ routingKey: string; payload: unknown }>,
    async ensureConnected() {},
    async publish(routingKey: string, payload: unknown) {
      this.published.push({ routingKey, payload });
    },
    reset() {
      this.published.length = 0;
    },
  };
  const s3Stub = {
    objects: new Map<string, S3ObjectMetadata>(),
    async generatePresignedUploadUrl(input: { key: string }) {
      return `https://uploads.test/${encodeURIComponent(input.key)}`;
    },
    async getObjectMetadata(key: string) {
      return this.objects.get(key) ?? null;
    },
    setObject(key: string, metadata: S3ObjectMetadata) {
      this.objects.set(key, metadata);
    },
    reset() {
      this.objects.clear();
    },
  };
  let app: INestApplication;
  let database: Knex;

  beforeAll(async () => {
    process.env.AWS_REGION ||= 'us-east-1';
    process.env.S3_BUCKET ||= 'quickbite-test-media';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue(cacheManager)
      .overrideProvider(EMAIL_PROVIDER_TOKEN)
      .useValue(emailStub)
      .overrideProvider(MessageBrokerService)
      .useValue(messageBrokerStub)
      .overrideProvider(S3_CLIENT)
      .useValue(s3Stub)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DatabaseErrorFilter());
    await app.init();
    database = app.get<Knex>('KNEX_CONNECTION');
    await assertTestDatabase(database);
  });

  beforeEach(async () => {
    await truncateAllTables(database);
    cache.clear();
    emailStub.reset();
    messageBrokerStub.reset();
    s3Stub.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  return {
    get app() {
      return app;
    },
    get database() {
      return database;
    },
    emailStub,
    messageBrokerStub,
    s3Stub,
    authCookie(payload: Record<string, unknown>) {
      const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '1h',
      });
      return `access_token=${token}`;
    },
  };
}
