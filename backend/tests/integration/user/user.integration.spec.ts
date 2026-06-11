import request from 'supertest';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('User HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();

  function cookie(userId: number, role = SystemRole.CUSTOMER) {
    return testApp.authCookie({
      userId,
      email: `user-${userId}@example.com`,
      role,
    });
  }

  describeEndpoint('GET /api/users/me', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database, {
        email: 'profile@example.com',
        name: 'Profile Customer',
      });

      const response = await request(testApp.app.getHttpServer())
        .get('/api/users/me')
        .set('Cookie', cookie(userId));

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: userId,
        email: 'profile@example.com',
        name: 'Profile Customer',
      });
      expect(response.body.data.passwordHash).toBeUndefined();
    },
    validation: async () => {
      const userId = await seedUser(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .get('/api/users/me?unexpected[invalid]=value')
        .set('Cookie', cookie(userId));

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(userId);
    },
    security: async () => {
      const ownId = await seedUser(testApp.database, { name: 'Own Profile' });
      await seedUser(testApp.database, { name: 'Foreign Profile' });

      await request(testApp.app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
      const authenticated = await request(testApp.app.getHttpServer())
        .get('/api/users/me')
        .set('Cookie', cookie(ownId));

      expect(authenticated.body.data).toMatchObject({
        id: ownId,
        name: 'Own Profile',
      });
    },
    businessLogic: async () => {
      const missingUserCookie = cookie(999999);
      await request(testApp.app.getHttpServer())
        .get('/api/users/me')
        .set('Cookie', missingUserCookie)
        .expect(404);
    },
  });

  describeEndpoint('PATCH /api/users/me', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .patch('/api/users/me')
        .set('Cookie', cookie(userId))
        .send({ name: 'Updated Customer', phone: '01112345678' });

      expect(response.status).toBe(200);
      await expect(
        testApp.database('users').where({ id: userId }).first(),
      ).resolves.toMatchObject({
        name: 'Updated Customer',
        phone: '01112345678',
      });
    },
    validation: async () => {
      const userId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .patch('/api/users/me')
        .set('Cookie', cookie(userId))
        .send({ phone: '123', name: 42 })
        .expect(400);
    },
    security: async () => {
      const ownId = await seedUser(testApp.database, { name: 'Own User' });
      const foreignId = await seedUser(testApp.database, {
        name: 'Foreign User',
      });

      await request(testApp.app.getHttpServer())
        .patch('/api/users/me')
        .send({ name: 'Denied' })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch('/api/users/me')
        .set('Cookie', cookie(ownId))
        .send({ name: 'Own User Updated' })
        .expect(200);

      await expect(
        testApp.database('users').where({ id: foreignId }).first(),
      ).resolves.toMatchObject({ name: 'Foreign User' });
    },
    businessLogic: async () => {
      const firstId = await seedUser(testApp.database, {
        phone: '01011111111',
      });
      await seedUser(testApp.database, { phone: '01022222222' });

      await request(testApp.app.getHttpServer())
        .patch('/api/users/me')
        .set('Cookie', cookie(firstId))
        .send({ phone: '01022222222' })
        .expect(409);
    },
  });

  describeEndpoint('GET /api/internal/agents/:id', {
    goldenPath: async () => {
      const agentId = await seedUser(testApp.database, {
        name: 'Delivery Agent',
        phone: '01099999999',
        system_role: SystemRole.DELIVERY_AGENT,
      });
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/internal/agents/${agentId}`)
        .set('x-api-key', 'test-internal-key');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        id: agentId,
        name: 'Delivery Agent',
        phone: '01099999999',
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/agents/not-a-number')
        .set('x-api-key', 'test-internal-key')
        .expect(400);
    },
    security: async () => {
      const agentId = await seedUser(testApp.database, {
        system_role: SystemRole.DELIVERY_AGENT,
      });
      await request(testApp.app.getHttpServer())
        .get(`/api/internal/agents/${agentId}`)
        .expect(401);
      await request(testApp.app.getHttpServer())
        .get(`/api/internal/agents/${agentId}`)
        .set('x-api-key', 'wrong-key')
        .expect(401);
    },
    businessLogic: async () => {
      const customerId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .get(`/api/internal/agents/${customerId}`)
        .set('x-api-key', 'test-internal-key')
        .expect(404);
    },
  });
});
