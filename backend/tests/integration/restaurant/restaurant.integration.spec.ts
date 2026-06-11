import request from 'supertest';
import { RestaurantStatus } from 'src/app/restaurant/enums';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { seedRestaurant, seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Restaurant HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();

  function cookie(
    userId: number,
    role: SystemRole,
    restaurantId?: number,
    restaurantRole = restaurantId ? 'owner' : undefined,
  ) {
    return testApp.authCookie({
      userId,
      email: `restaurant-${userId}@example.com`,
      role,
      restaurantId,
      restaurantRole,
      branchIds: [],
    });
  }

  const provisionPayload = {
    owner: {
      email: 'provisioned.owner@example.com',
      phone: '01098765432',
      name: 'Provisioned Owner',
      password: 'Password123',
    },
    name: 'Provisioned Kitchen',
    logoUrl: 'https://cdn.test/provisioned.png',
    primaryCountry: 'EG',
  };

  describeEndpoint('GET /api/restaurants', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      await seedRestaurant(testApp.database, ownerId, { name: 'First' });
      await seedRestaurant(testApp.database, ownerId, { name: 'Second' });
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/restaurants?limit=1&sortBy=id',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({ count: 1, hasMore: true });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/restaurants?sortBy=not_a_column')
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      await seedRestaurant(testApp.database, ownerId);
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/restaurants',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      await seedRestaurant(testApp.database, ownerId, {
        status: RestaurantStatus.ACTIVE,
      });
      await seedRestaurant(testApp.database, ownerId, {
        status: RestaurantStatus.SUSPENDED,
      });
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/restaurants?filter[status][eq]=active&sortBy=id',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(RestaurantStatus.ACTIVE);
    },
  });

  describeEndpoint('GET /api/restaurants/:id', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        name: 'Visible Kitchen',
      });
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/restaurants/${restaurantId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: restaurantId,
        name: 'Visible Kitchen',
        status: RestaurantStatus.ACTIVE,
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/restaurants/not-a-number')
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}`)
        .expect(200);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        status: RestaurantStatus.SUSPENDED,
      });
      await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}`)
        .expect(404);
    },
  });

  describeEndpoint('POST /api/restaurants', {
    goldenPath: async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/restaurants')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-create-golden')
        .send(provisionPayload);

      expect(response.status).toBe(201);
      const owner = await testApp
        .database('users')
        .where({ email: provisionPayload.owner.email })
        .first();
      await expect(
        testApp.database('restaurants').where({ owner_id: owner.id }).first(),
      ).resolves.toMatchObject({
        name: provisionPayload.name,
        status: RestaurantStatus.PENDING,
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/restaurants')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-create-validation')
        .send({ owner: { email: 'bad', password: 'weak' }, name: '' })
        .expect(400);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/restaurants')
        .set('Idempotency-Key', 'restaurant-create-no-auth')
        .send(provisionPayload)
        .expect(401);
      const customerId = await seedUser(testApp.database);
      await request(testApp.app.getHttpServer())
        .post('/api/restaurants')
        .set('Cookie', cookie(customerId, SystemRole.CUSTOMER))
        .set('Idempotency-Key', 'restaurant-create-wrong-role')
        .send(provisionPayload)
        .expect(403);
    },
    businessLogic: async () => {
      await seedUser(testApp.database, {
        email: provisionPayload.owner.email,
        phone: provisionPayload.owner.phone,
      });
      await request(testApp.app.getHttpServer())
        .post('/api/restaurants')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-create-duplicate')
        .send(provisionPayload)
        .expect(409);

      expect(await testApp.database('restaurants')).toHaveLength(0);
    },
  });

  describeEndpoint('PATCH /api/restaurants/:id', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database, {
        system_role: SystemRole.RESTAURANT_USER,
      });
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}`)
        .set(
          'Cookie',
          cookie(ownerId, SystemRole.RESTAURANT_USER, restaurantId),
        )
        .set('Idempotency-Key', 'restaurant-update-golden')
        .send({ name: 'Updated Kitchen', primaryCountry: 'SA' })
        .expect(200);

      await expect(
        testApp.database('restaurants').where({ id: restaurantId }).first(),
      ).resolves.toMatchObject({
        name: 'Updated Kitchen',
        primary_country: 'SA',
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/restaurants/not-a-number')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-update-validation')
        .send({ name: '' })
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const staffId = await seedUser(testApp.database);
      const managerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        name: 'Owner Kitchen',
      });
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}`)
        .set('Idempotency-Key', 'restaurant-update-no-auth')
        .send({ name: 'Denied' })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}`)
        .set(
          'Cookie',
          cookie(attackerId, SystemRole.RESTAURANT_USER, restaurantId + 1),
        )
        .set('Idempotency-Key', 'restaurant-update-cross-tenant')
        .send({ name: 'Stolen' })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}`)
        .set(
          'Cookie',
          cookie(staffId, SystemRole.RESTAURANT_USER, restaurantId, 'staff'),
        )
        .set('Idempotency-Key', 'restaurant-update-staff-denied')
        .send({ name: 'Staff Edit' })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}`)
        .set(
          'Cookie',
          cookie(
            managerId,
            SystemRole.RESTAURANT_USER,
            restaurantId,
            'branch_manager',
          ),
        )
        .set('Idempotency-Key', 'restaurant-update-manager-denied')
        .send({ name: 'Manager Edit' })
        .expect(403);
      await expect(
        testApp.database('restaurants').where({ id: restaurantId }).first(),
      ).resolves.toMatchObject({ name: 'Owner Kitchen' });
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/restaurants/999999')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-update-missing')
        .send({ name: 'Missing' })
        .expect(404);
    },
  });

  describeEndpoint('PATCH /api/restaurants/:id/status', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        status: RestaurantStatus.PENDING,
      });
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-status-golden')
        .send({ status: RestaurantStatus.ACTIVE })
        .expect(200);

      await expect(
        testApp.database('restaurants').where({ id: restaurantId }).first(),
      ).resolves.toMatchObject({ status: RestaurantStatus.ACTIVE });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/restaurants/1/status')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-status-validation')
        .send({ status: 'unknown' })
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const staffId = await seedUser(testApp.database);
      const managerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set('Idempotency-Key', 'restaurant-status-no-auth')
        .send({ status: RestaurantStatus.SUSPENDED })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set(
          'Cookie',
          cookie(ownerId, SystemRole.RESTAURANT_USER, restaurantId),
        )
        .set('Idempotency-Key', 'restaurant-status-owner-denied')
        .send({ status: RestaurantStatus.SUSPENDED })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set(
          'Cookie',
          cookie(
            managerId,
            SystemRole.RESTAURANT_USER,
            restaurantId,
            'branch_manager',
          ),
        )
        .set('Idempotency-Key', 'restaurant-status-manager-denied')
        .send({ status: RestaurantStatus.SUSPENDED })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set(
          'Cookie',
          cookie(staffId, SystemRole.RESTAURANT_USER, restaurantId, 'staff'),
        )
        .set('Idempotency-Key', 'restaurant-status-staff-denied')
        .send({ status: RestaurantStatus.SUSPENDED })
        .expect(403);
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/restaurants/999999/status')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'restaurant-status-missing')
        .send({ status: RestaurantStatus.ACTIVE })
        .expect(404);
    },
  });
});
