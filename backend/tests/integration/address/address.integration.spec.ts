import request from 'supertest';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { seedAddress, seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Address HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();

  function cookie(userId: number) {
    return testApp.authCookie({
      userId,
      email: `address-${userId}@example.com`,
      role: SystemRole.CUSTOMER,
    });
  }

  const validAddress = {
    label: 'Home',
    country: 'Egypt',
    city: 'Cairo',
    street: 'Main Street',
    building: '10',
    apartmentNumber: '4',
    type: 'home',
    lat: 30.0444,
    lng: 31.2357,
    isDefault: true,
  };

  describeEndpoint('GET /api/customer/addresses', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, userId, {
        label: 'Home',
      });
      const response = await request(testApp.app.getHttpServer())
        .get('/api/customer/addresses')
        .set('Cookie', cookie(userId));

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([
        expect.objectContaining({ id: addressId, label: 'Home' }),
      ]);
    },
    validation: async () => {
      const userId = await seedUser(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .get('/api/customer/addresses?limit=not-a-number')
        .set('Cookie', cookie(userId));

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([]);
    },
    security: async () => {
      const firstId = await seedUser(testApp.database);
      const secondId = await seedUser(testApp.database);
      await seedAddress(testApp.database, secondId, { label: 'Private' });

      await request(testApp.app.getHttpServer())
        .get('/api/customer/addresses')
        .expect(401);
      const response = await request(testApp.app.getHttpServer())
        .get('/api/customer/addresses')
        .set('Cookie', cookie(firstId));
      expect(response.body.data.data).toEqual([]);
    },
    businessLogic: async () => {
      const userId = await seedUser(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .get('/api/customer/addresses')
        .set('Cookie', cookie(userId));

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([]);
    },
  });

  describeEndpoint('POST /api/customer/addresses', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .post('/api/customer/addresses')
        .set('Cookie', cookie(userId))
        .send(validAddress);

      expect(response.status).toBe(201);
      await expect(
        testApp
          .database('customer_addresses')
          .where({ user_id: userId })
          .first(),
      ).resolves.toMatchObject({ label: 'Home', is_default: true });
    },
    validation: async () => {
      const userId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .post('/api/customer/addresses')
        .set('Cookie', cookie(userId))
        .send({ label: '', lat: 200, lng: 300 })
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/customer/addresses')
        .send(validAddress)
        .expect(401);
      expect(await testApp.database('customer_addresses')).toHaveLength(0);
    },
    businessLogic: async () => {
      const userId = await seedUser(testApp.database);
      const oldDefaultId = await seedAddress(testApp.database, userId, {
        is_default: true,
      });
      await request(testApp.app.getHttpServer())
        .post('/api/customer/addresses')
        .set('Cookie', cookie(userId))
        .send(validAddress)
        .expect(201);

      await expect(
        testApp
          .database('customer_addresses')
          .where({ id: oldDefaultId })
          .first(),
      ).resolves.toMatchObject({ is_default: false });
    },
  });

  describeEndpoint('PATCH /api/customer/addresses/:addressId', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, userId);
      await request(testApp.app.getHttpServer())
        .patch(`/api/customer/addresses/${addressId}`)
        .set('Cookie', cookie(userId))
        .send({ label: 'Office', city: 'Giza' })
        .expect(200);

      await expect(
        testApp.database('customer_addresses').where({ id: addressId }).first(),
      ).resolves.toMatchObject({ label: 'Office', city: 'Giza' });
    },
    validation: async () => {
      const userId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .patch('/api/customer/addresses/not-a-number')
        .set('Cookie', cookie(userId))
        .send({ lat: 500 })
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, ownerId, {
        label: 'Owner Address',
      });

      await request(testApp.app.getHttpServer())
        .patch(`/api/customer/addresses/${addressId}`)
        .send({ label: 'Denied' })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch(`/api/customer/addresses/${addressId}`)
        .set('Cookie', cookie(attackerId))
        .send({ label: 'Stolen' })
        .expect(404);
      await expect(
        testApp.database('customer_addresses').where({ id: addressId }).first(),
      ).resolves.toMatchObject({ label: 'Owner Address' });
    },
    businessLogic: async () => {
      const userId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .patch('/api/customer/addresses/999999')
        .set('Cookie', cookie(userId))
        .send({ label: 'Missing' })
        .expect(404);
    },
  });

  describeEndpoint('DELETE /api/customer/addresses/:addressId', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, userId);
      await request(testApp.app.getHttpServer())
        .delete(`/api/customer/addresses/${addressId}`)
        .set('Cookie', cookie(userId))
        .expect(200);

      expect(
        await testApp
          .database('customer_addresses')
          .where({ id: addressId })
          .first(),
      ).toBeUndefined();
    },
    validation: async () => {
      const userId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .delete('/api/customer/addresses/not-a-number')
        .set('Cookie', cookie(userId))
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, ownerId);

      await request(testApp.app.getHttpServer())
        .delete(`/api/customer/addresses/${addressId}`)
        .expect(401);
      await request(testApp.app.getHttpServer())
        .delete(`/api/customer/addresses/${addressId}`)
        .set('Cookie', cookie(attackerId))
        .expect(404);
      expect(
        await testApp
          .database('customer_addresses')
          .where({ id: addressId })
          .first(),
      ).toBeDefined();
    },
    businessLogic: async () => {
      const userId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .delete('/api/customer/addresses/999999')
        .set('Cookie', cookie(userId))
        .expect(404);
    },
  });

  describeEndpoint('GET /api/internal/customer-addresses/:addressId', {
    goldenPath: async () => {
      const userId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, userId, {
        label: 'Internal',
      });
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/internal/customer-addresses/${addressId}`)
        .set('x-api-key', 'test-internal-key');

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: addressId,
        userId,
        label: 'Internal',
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/customer-addresses/not-a-number')
        .set('x-api-key', 'test-internal-key')
        .expect(400);
    },
    security: async () => {
      const userId = await seedUser(testApp.database);
      const addressId = await seedAddress(testApp.database, userId);
      await request(testApp.app.getHttpServer())
        .get(`/api/internal/customer-addresses/${addressId}`)
        .expect(401);
      await request(testApp.app.getHttpServer())
        .get(`/api/internal/customer-addresses/${addressId}`)
        .set('x-api-key', 'wrong-key')
        .expect(401);
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/customer-addresses/999999')
        .set('x-api-key', 'test-internal-key')
        .expect(404);
    },
  });
});
