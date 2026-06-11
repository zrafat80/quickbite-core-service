import request from 'supertest';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Health and logging HTTP integration', () => {
  const testApp = useCoreIntegrationApp();
  let adminCookie: string;
  let customerCookie: string;
  let restaurantCookie: string;

  beforeEach(() => {
    adminCookie = testApp.authCookie({
      userId: 9001,
      email: 'admin@example.com',
      role: SystemRole.SYSTEM_ADMIN,
    });
    customerCookie = testApp.authCookie({
      userId: 9002,
      email: 'customer@example.com',
      role: SystemRole.CUSTOMER,
    });
    restaurantCookie = testApp.authCookie({
      userId: 9003,
      email: 'owner@example.com',
      role: SystemRole.RESTAURANT_USER,
      restaurantId: 10,
      restaurantRole: 'owner',
      branchIds: [],
    });
  });

  async function seedLog(userId: number, action: string) {
    const [log] = await testApp
      .database('logs')
      .insert({
        timestamp: new Date('2026-06-01T12:00:00.000Z'),
        level: 'log',
        correlationId: `correlation-${userId}`,
        packetType: 'response',
        userId,
        ipAddress: '127.0.0.1',
        userAgent: 'integration-test',
        action,
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 12,
      })
      .returning(['id']);
    return Number(log.id);
  }

  describeEndpoint('GET /api/health', {
    goldenPath: async () => {
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/health',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        service: 'api',
        database: 'healthy',
      });
      expect(response.body.data.timestamp).toEqual(expect.any(String));
    },
    validation: async () => {
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/health?check=cache',
      );

      expect(response.status).toBe(400);
    },
    security: async () => {
      const unauthenticated = await request(testApp.app.getHttpServer()).get(
        '/api/health',
      );
      const authenticated = await request(testApp.app.getHttpServer())
        .get('/api/health')
        .set('Cookie', customerCookie);

      expect(unauthenticated.status).toBe(200);
      expect(authenticated.status).toBe(200);
      expect(unauthenticated.body.data).not.toHaveProperty('connectionString');
    },
    businessLogic: async () => {
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/health?check=database',
      );
      expect(response.status).toBe(200);

      let persisted;
      for (let attempt = 0; attempt < 10 && !persisted; attempt += 1) {
        persisted = await testApp
          .database('logs')
          .where({
            endpoint: '/api/health?check=database',
            method: 'GET',
          })
          .first();
        if (!persisted) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      expect(persisted).toMatchObject({
        level: 'log',
        packetType: 'response',
        action: 'HealthController.checkHealth',
      });
    },
  });

  describeEndpoint('GET /api/logs', {
    goldenPath: async () => {
      const logId = await seedLog(41, 'OrderController.create');

      const response = await request(testApp.app.getHttpServer())
        .get('/api/logs')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: logId,
            userId: 41,
            action: 'OrderController.create',
          }),
        ]),
      );
    },
    validation: async () => {
      const wrongType = await request(testApp.app.getHttpServer())
        .get('/api/logs?userId=not-a-number')
        .set('Cookie', adminCookie);
      const negative = await request(testApp.app.getHttpServer())
        .get('/api/logs?userId=-1')
        .set('Cookie', adminCookie);

      expect(wrongType.status).toBe(400);
      expect(negative.status).toBe(400);
    },
    security: async () => {
      const unauthenticated = await request(testApp.app.getHttpServer()).get(
        '/api/logs',
      );
      const wrongRole = await request(testApp.app.getHttpServer())
        .get('/api/logs')
        .set('Cookie', customerCookie);
      const tenantUser = await request(testApp.app.getHttpServer())
        .get('/api/logs')
        .set('Cookie', restaurantCookie);

      expect(unauthenticated.status).toBe(401);
      expect(wrongRole.status).toBe(403);
      expect(tenantUser.status).toBe(403);
    },
    businessLogic: async () => {
      await seedLog(51, 'Target.action');
      await seedLog(52, 'Other.action');

      const response = await request(testApp.app.getHttpServer())
        .get('/api/logs?userId=51')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          userId: 51,
          action: 'Target.action',
        }),
      ]);
    },
  });
});
