import request from 'supertest';
import { RestaurantStatus } from 'src/app/restaurant/enums';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { seedCatalog, seedRestaurant, seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Product HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();

  function cookie(
    userId: number,
    restaurantId: number,
    branchIds: number[] = [],
    restaurantRole = 'owner',
  ) {
    return testApp.authCookie({
      userId,
      email: `catalog-${userId}@example.com`,
      role: SystemRole.RESTAURANT_USER,
      restaurantId,
      restaurantRole,
      branchIds,
    });
  }

  describeEndpoint('GET /api/restaurants/:restaurantId/categories', {
    goldenPath: async () => {
      const { restaurantId, categoryId } = await seedCatalog(testApp.database);
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/restaurants/${restaurantId}/categories`,
      );
      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([
        expect.objectContaining({ id: categoryId, name: 'Meals' }),
      ]);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/restaurants/not-a-number/categories')
        .expect(400);
    },
    security: async () => {
      const { restaurantId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/categories`)
        .expect(200);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/restaurants/${restaurantId}/categories`,
      );
      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([]);
    },
  });

  describeEndpoint('GET /api/branches/:branchId/products', {
    goldenPath: async () => {
      const { branchId, productId } = await seedCatalog(testApp.database);
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/branches/${branchId}/products?sortBy=id`,
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          id: productId,
          name: 'Burger',
          price: 2500,
          stock: 8,
        }),
      ]);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/branches/not-a-number/products')
        .expect(400);
    },
    security: async () => {
      const { branchId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .get(`/api/branches/${branchId}/products`)
        .expect(200);
    },
    businessLogic: async () => {
      const { branchId, productId } = await seedCatalog(testApp.database);
      await testApp
        .database('product_branch_details')
        .where({ branch_id: branchId, product_id: productId })
        .update({ is_available: false });
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/branches/${branchId}/products`,
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    },
  });

  describeEndpoint('GET /api/restaurants/:restaurantId/products', {
    goldenPath: async () => {
      const { ownerId, restaurantId, productId } = await seedCatalog(
        testApp.database,
      );
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/products?sortBy=id`)
        .set('Cookie', cookie(ownerId, restaurantId));
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        expect.objectContaining({ id: productId, name: 'Burger' }),
      ]);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/restaurants/not-a-number/products')
        .set('Cookie', cookie(999, 1))
        .expect(400);
    },
    security: async () => {
      const { restaurantId } = await seedCatalog(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const attackerRestaurantId = await seedRestaurant(
        testApp.database,
        attackerId,
      );
      await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/products`)
        .expect(401);
      await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/products`)
        .set('Cookie', cookie(attackerId, attackerRestaurantId))
        .expect(403);
    },
    businessLogic: async () => {
      const { ownerId, restaurantId, productId } = await seedCatalog(
        testApp.database,
      );
      await testApp
        .database('products')
        .where({ id: productId })
        .update({ deleted_at: new Date() });
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/products`)
        .set('Cookie', cookie(ownerId, restaurantId));
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    },
  });

  describeEndpoint('GET /api/products/:id', {
    goldenPath: async () => {
      const { productId } = await seedCatalog(testApp.database);
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/products/${productId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: productId,
        name: 'Burger',
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/products/not-a-number')
        .expect(400);
    },
    security: async () => {
      const { productId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200);
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/products/999999')
        .expect(404);
    },
  });

  describeEndpoint('POST /api/restaurants/:restaurantId/products', {
    goldenPath: async () => {
      const { ownerId, restaurantId } = await seedCatalog(testApp.database);
      const response = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/products`)
        .set('Cookie', cookie(ownerId, restaurantId))
        .set('Idempotency-Key', 'product-create-golden')
        .send({
          name: 'Pizza',
          description: 'Cheese pizza',
          imageUrl: 'https://cdn.test/pizza.png',
          categoryName: 'Pizza',
        });
      expect(response.status).toBe(201);
      const category = await testApp
        .database('product_categories')
        .where({ restaurant_id: restaurantId, name: 'Pizza' })
        .first();
      await expect(
        testApp
          .database('products')
          .where({ restaurant_id: restaurantId, name: 'Pizza' })
          .first(),
      ).resolves.toMatchObject({ category_id: category.id });
    },
    validation: async () => {
      const { ownerId, restaurantId } = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/products`)
        .set('Cookie', cookie(ownerId, restaurantId))
        .set('Idempotency-Key', 'product-create-validation')
        .send({ name: 123, description: false })
        .expect(400);
    },
    security: async () => {
      const { restaurantId } = await seedCatalog(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const attackerRestaurantId = await seedRestaurant(
        testApp.database,
        attackerId,
      );
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/products`)
        .set('Idempotency-Key', 'product-create-no-auth')
        .send({ name: 'Denied' })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/products`)
        .set('Cookie', cookie(attackerId, attackerRestaurantId))
        .set('Idempotency-Key', 'product-create-cross-tenant')
        .send({ name: 'Stolen' })
        .expect(403);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        status: RestaurantStatus.SUSPENDED,
      });
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/products`)
        .set('Cookie', cookie(ownerId, restaurantId))
        .set('Idempotency-Key', 'product-create-inactive')
        .send({ name: 'Unavailable' })
        .expect(404);
      expect(await testApp.database('products')).toHaveLength(0);
    },
  });

  describeEndpoint('PATCH /api/products/:id', {
    goldenPath: async () => {
      const { ownerId, restaurantId, branchId, productId } = await seedCatalog(
        testApp.database,
      );
      const managerId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${branchId}`)
        .set('Cookie', cookie(ownerId, restaurantId, [branchId]))
        .set('Idempotency-Key', 'product-update-golden')
        .send({
          name: 'Premium Burger',
          price: 3000,
          stock: 12,
          isAvailable: true,
        })
        .expect(200);
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${branchId}`)
        .set(
          'Cookie',
          cookie(
            managerId,
            restaurantId,
            [branchId],
            'branch_manager',
          ),
        )
        .set('Idempotency-Key', 'product-update-assigned-manager')
        .send({ stock: 14 })
        .expect(200);
      await expect(
        testApp.database('products').where({ id: productId }).first(),
      ).resolves.toMatchObject({ name: 'Premium Burger' });
      await expect(
        testApp
          .database('product_branch_details')
          .where({ branch_id: branchId, product_id: productId })
          .first(),
      ).resolves.toMatchObject({ price: 3000, stock: 14 });
      expect(
        await testApp.database('events_outbox').where({
          aggregate_id: `${branchId}:${productId}`,
        }),
      ).not.toHaveLength(0);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/products/not-a-number?branchId=bad')
        .set('Cookie', cookie(999, 1))
        .set('Idempotency-Key', 'product-update-validation')
        .send({ price: -1, stock: -2 })
        .expect(400);
    },
    security: async () => {
      const { restaurantId, branchId, productId } = await seedCatalog(
        testApp.database,
      );
      const attackerId = await seedUser(testApp.database);
      const staffId = await seedUser(testApp.database);
      const managerId = await seedUser(testApp.database);
      const attackerRestaurantId = await seedRestaurant(
        testApp.database,
        attackerId,
      );
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${branchId}`)
        .set('Idempotency-Key', 'product-update-no-auth')
        .send({ name: 'Denied' })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${branchId}`)
        .set('Cookie', cookie(attackerId, attackerRestaurantId, []))
        .set('Idempotency-Key', 'product-update-cross-tenant')
        .send({ name: 'Stolen' })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${branchId}`)
        .set('Cookie', cookie(staffId, restaurantId, [branchId], 'staff'))
        .set('Idempotency-Key', 'product-update-staff-denied')
        .send({ name: 'Staff Edit' })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${branchId}`)
        .set('Cookie', cookie(managerId, restaurantId, [], 'branch_manager'))
        .set('Idempotency-Key', 'product-update-unassigned-manager')
        .send({ name: 'Manager Edit' })
        .expect(403);
      await expect(
        testApp.database('products').where({ id: productId }).first(),
      ).resolves.toMatchObject({
        name: 'Burger',
        restaurant_id: String(restaurantId),
      });
    },
    businessLogic: async () => {
      const { ownerId, restaurantId, productId } = await seedCatalog(
        testApp.database,
      );
      const otherCatalog = await seedCatalog(testApp.database);
      await request(testApp.app.getHttpServer())
        .patch(`/api/products/${productId}?branchId=${otherCatalog.branchId}`)
        .set('Cookie', cookie(ownerId, restaurantId, [otherCatalog.branchId]))
        .set('Idempotency-Key', 'product-update-foreign-branch')
        .send({ name: 'Should Roll Back', stock: 2 })
        .expect(404);
      await expect(
        testApp.database('products').where({ id: productId }).first(),
      ).resolves.toMatchObject({ name: 'Burger' });
    },
  });
});
