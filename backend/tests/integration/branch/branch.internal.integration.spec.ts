import request from 'supertest';
import { describeEndpoint } from '../helpers/completeness-matrix';
import {
  seedBranch,
  seedCatalog,
  seedRestaurant,
  seedUser,
} from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Branch internal HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();
  const apiKey = { 'x-api-key': 'test-internal-key' };

  describeEndpoint('GET /api/internal/branches/:branchId', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        name: 'Internal Kitchen',
      });
      const branchId = await seedBranch(testApp.database, restaurantId, {
        label: 'Internal Branch',
      });
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/internal/branches/${branchId}`)
        .set(apiKey);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: branchId,
        restaurantId,
        restaurantName: 'Internal Kitchen',
        label: 'Internal Branch',
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/not-a-number')
        .set(apiKey)
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/1')
        .expect(401);
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/1')
        .set('x-api-key', 'wrong')
        .expect(401);
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/999999')
        .set(apiKey)
        .expect(404);
    },
  });

  describeEndpoint('GET /api/internal/branches?ids=', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const firstId = await seedBranch(testApp.database, restaurantId);
      const secondId = await seedBranch(testApp.database, restaurantId);
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/internal/branches?ids=${firstId},${secondId}`)
        .set(apiKey);

      expect(response.status).toBe(200);
      expect(
        response.body.data.map((branch: { id: number }) => branch.id),
      ).toEqual(expect.arrayContaining([firstId, secondId]));
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches?ids=1,bad,-2')
        .set(apiKey)
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches?ids=1')
        .expect(401);
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches?ids=1')
        .set('x-api-key', 'wrong')
        .expect(401);
    },
    businessLogic: async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/internal/branches?ids=999998,999999')
        .set(apiKey);
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    },
  });

  describeEndpoint('GET /api/internal/branches/:branchId/products', {
    goldenPath: async () => {
      const { branchId, productId } = await seedCatalog(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/internal/branches/${branchId}/products?ids=${productId}`)
        .set(apiKey);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        expect.objectContaining({ productId, stock: 8, price: 2500 }),
      ]);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/1/products?ids=bad,-1')
        .set(apiKey)
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/1/products?ids=1')
        .expect(401);
      await request(testApp.app.getHttpServer())
        .get('/api/internal/branches/1/products?ids=1')
        .set('x-api-key', 'wrong')
        .expect(401);
    },
    businessLogic: async () => {
      const { branchId } = await seedCatalog(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/internal/branches/${branchId}/products?ids=999999`)
        .set(apiKey);
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    },
  });

  describeEndpoint('POST /api/internal/branches/:branchId/reserve-stock', {
    goldenPath: async () => {
      const { branchId, productId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .post(`/api/internal/branches/${branchId}/reserve-stock`)
        .set(apiKey)
        .set('Idempotency-Key', 'reserve-golden')
        .send({ items: [{ productId, quantity: 3 }] })
        .expect(201);

      await expect(
        testApp
          .database('product_branch_details')
          .where({ branch_id: branchId, product_id: productId })
          .first(),
      ).resolves.toMatchObject({ stock: 5 });
      expect(
        await testApp.database('events_outbox').where({
          aggregate_id: `${branchId}:${productId}`,
        }),
      ).toHaveLength(1);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/internal/branches/1/reserve-stock')
        .set(apiKey)
        .set('Idempotency-Key', 'reserve-validation')
        .send({ items: [{ productId: -1, quantity: 0 }] })
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/internal/branches/1/reserve-stock')
        .set('Idempotency-Key', 'reserve-no-key')
        .send({ items: [{ productId: 1, quantity: 1 }] })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .post('/api/internal/branches/1/reserve-stock')
        .set('x-api-key', 'wrong')
        .set('Idempotency-Key', 'reserve-wrong-key')
        .send({ items: [{ productId: 1, quantity: 1 }] })
        .expect(401);
    },
    businessLogic: async () => {
      const { branchId, productId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .post(`/api/internal/branches/${branchId}/reserve-stock`)
        .set(apiKey)
        .set('Idempotency-Key', 'reserve-insufficient')
        .send({ items: [{ productId, quantity: 99 }] })
        .expect(409);
      await expect(
        testApp
          .database('product_branch_details')
          .where({ branch_id: branchId, product_id: productId })
          .first(),
      ).resolves.toMatchObject({ stock: 8 });
    },
  });

  describeEndpoint('POST /api/internal/branches/:branchId/release-stock', {
    goldenPath: async () => {
      const { branchId, productId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .post(`/api/internal/branches/${branchId}/release-stock`)
        .set(apiKey)
        .set('Idempotency-Key', 'release-golden')
        .send({ items: [{ productId, quantity: 2 }] })
        .expect(201);

      await expect(
        testApp
          .database('product_branch_details')
          .where({ branch_id: branchId, product_id: productId })
          .first(),
      ).resolves.toMatchObject({ stock: 10 });
      expect(
        await testApp.database('events_outbox').where({
          aggregate_id: `${branchId}:${productId}`,
        }),
      ).toHaveLength(1);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/internal/branches/1/release-stock')
        .set(apiKey)
        .set('Idempotency-Key', 'release-validation')
        .send({ items: [] })
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/internal/branches/1/release-stock')
        .set('Idempotency-Key', 'release-no-key')
        .send({ items: [{ productId: 1, quantity: 1 }] })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .post('/api/internal/branches/1/release-stock')
        .set('x-api-key', 'wrong')
        .set('Idempotency-Key', 'release-wrong-key')
        .send({ items: [{ productId: 1, quantity: 1 }] })
        .expect(401);
    },
    businessLogic: async () => {
      const { branchId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .post(`/api/internal/branches/${branchId}/release-stock`)
        .set(apiKey)
        .set('Idempotency-Key', 'release-missing-product')
        .send({ items: [{ productId: 999999, quantity: 1 }] })
        .expect(404);
    },
  });
});
