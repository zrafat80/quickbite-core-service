import request from 'supertest';
import { RestaurantStatus } from 'src/app/restaurant/enums';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { seedBranch, seedRestaurant, seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Branch public and management HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();

  function cookie(
    userId: number,
    role: SystemRole,
    restaurantId?: number,
    restaurantRole = 'owner',
    branchIds: number[] = [],
  ) {
    return testApp.authCookie({
      userId,
      email: `branch-${userId}@example.com`,
      role,
      restaurantId,
      restaurantRole,
      branchIds,
    });
  }

  const branchPayload = {
    countryCode: 'EG',
    label: 'New Branch',
    addressText: 'New Cairo',
    lat: 30.01,
    lng: 31.4,
    opensAt: '08:00',
    closesAt: '23:00',
    deliveryRadius: 8,
    currency: 'EGP',
  };

  describeEndpoint('GET /api/branches/nearby', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        name: 'Nearby Kitchen',
      });
      const branchId = await seedBranch(testApp.database, restaurantId, {
        label: 'Nearby Branch',
      });
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/branches/nearby?lat=30.0444&lng=31.2357&sortBy=id',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          id: branchId,
          restaurantName: 'Nearby Kitchen',
        }),
      ]);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/branches/nearby?lat=bad&lng=31')
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await seedBranch(testApp.database, restaurantId);
      await request(testApp.app.getHttpServer())
        .get('/api/branches/nearby?lat=30.0444&lng=31.2357')
        .expect(200);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await seedBranch(testApp.database, restaurantId, { is_active: false });
      await seedBranch(testApp.database, restaurantId, {
        lat: 31.2,
        lng: 29.9,
        delivery_radius: 1,
      });
      const response = await request(testApp.app.getHttpServer()).get(
        '/api/branches/nearby?lat=30.0444&lng=31.2357&sortBy=id',
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    },
  });

  describeEndpoint('GET /api/restaurants/:restaurantId/branches', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const branchId = await seedBranch(testApp.database, restaurantId, {
        label: 'Listed Branch',
      });
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/restaurants/${restaurantId}/branches?sortBy=id`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([
        expect.objectContaining({ id: branchId, label: 'Listed Branch' }),
      ]);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/restaurants/not-a-number/branches')
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await seedBranch(testApp.database, restaurantId);
      await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/branches`)
        .expect(200);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await seedBranch(testApp.database, restaurantId, { is_active: true });
      await seedBranch(testApp.database, restaurantId, { is_active: false });
      const response = await request(testApp.app.getHttpServer()).get(
        `/api/restaurants/${restaurantId}/branches?filter[isActive][eq]=true&sortBy=id`,
      );
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(true);
    },
  });

  describeEndpoint('POST /api/restaurants/:restaurantId/branches', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const response = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/branches`)
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-create-golden')
        .send(branchPayload);

      expect(response.status).toBe(201);
      await expect(
        testApp
          .database('restaurant_branches')
          .where({ id: response.body.data.id })
          .first(),
      ).resolves.toMatchObject({
        restaurant_id: String(restaurantId),
        label: branchPayload.label,
        is_active: false,
      });
    },
    validation: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/branches`)
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-create-validation')
        .send({ ...branchPayload, label: '', deliveryRadius: -1, lat: 'bad' })
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const attackerRestaurantId = await seedRestaurant(
        testApp.database,
        attackerId,
      );
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/branches`)
        .set('Idempotency-Key', 'branch-create-no-auth')
        .send(branchPayload)
        .expect(401);
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/branches`)
        .set(
          'Cookie',
          cookie(attackerId, SystemRole.RESTAURANT_USER, attackerRestaurantId),
        )
        .set('Idempotency-Key', 'branch-create-cross-tenant')
        .send(branchPayload)
        .expect(403);
    },
    businessLogic: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId, {
        status: RestaurantStatus.SUSPENDED,
      });
      await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/branches`)
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-create-inactive-restaurant')
        .send(branchPayload)
        .expect(404);
      expect(await testApp.database('restaurant_branches')).toHaveLength(0);
    },
  });

  describeEndpoint('PATCH /api/branches/:branchId', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const managerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const branchId = await seedBranch(testApp.database, restaurantId);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set(
          'Cookie',
          cookie(ownerId, SystemRole.RESTAURANT_USER, restaurantId),
        )
        .set('Idempotency-Key', 'branch-update-golden')
        .send({ label: 'Renamed Branch', acceptOrders: false })
        .expect(200);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set(
          'Cookie',
          cookie(
            managerId,
            SystemRole.RESTAURANT_USER,
            restaurantId,
            'branch_manager',
            [branchId],
          ),
        )
        .set('Idempotency-Key', 'branch-update-assigned-manager')
        .send({ label: 'Manager Updated Branch' })
        .expect(200);
      await expect(
        testApp.database('restaurant_branches').where({ id: branchId }).first(),
      ).resolves.toMatchObject({
        label: 'Manager Updated Branch',
        accept_orders: false,
      });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/branches/not-a-number')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-update-validation')
        .send({ deliveryRadius: -1, acceptOrders: 'yes' })
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const attackerId = await seedUser(testApp.database);
      const staffId = await seedUser(testApp.database);
      const managerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const attackerRestaurantId = await seedRestaurant(
        testApp.database,
        attackerId,
      );
      const branchId = await seedBranch(testApp.database, restaurantId, {
        label: 'Protected Branch',
      });
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set('Idempotency-Key', 'branch-update-no-auth')
        .send({ label: 'Denied' })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set(
          'Cookie',
          cookie(attackerId, SystemRole.RESTAURANT_USER, attackerRestaurantId),
        )
        .set('Idempotency-Key', 'branch-update-cross-tenant')
        .send({ label: 'Stolen' })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set(
          'Cookie',
          cookie(staffId, SystemRole.RESTAURANT_USER, restaurantId, 'staff', [
            branchId,
          ]),
        )
        .set('Idempotency-Key', 'branch-update-staff-denied')
        .send({ label: 'Staff Edit' })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set(
          'Cookie',
          cookie(
            managerId,
            SystemRole.RESTAURANT_USER,
            restaurantId,
            'branch_manager',
            [],
          ),
        )
        .set('Idempotency-Key', 'branch-update-unassigned-manager')
        .send({ label: 'Manager Edit' })
        .expect(403);
      await expect(
        testApp.database('restaurant_branches').where({ id: branchId }).first(),
      ).resolves.toMatchObject({ label: 'Protected Branch' });
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/branches/999999')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-update-missing')
        .send({ label: 'Missing' })
        .expect(404);
    },
  });

  describeEndpoint('PATCH /api/branches/:branchId/status', {
    goldenPath: async () => {
      const ownerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const branchId = await seedBranch(testApp.database, restaurantId, {
        is_active: false,
      });
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}/status`)
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-status-golden')
        .send({ isActive: true, commission: 15 })
        .expect(200);
      await expect(
        testApp.database('restaurant_branches').where({ id: branchId }).first(),
      ).resolves.toMatchObject({ is_active: true, commission: 15 });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/branches/1/status')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-status-validation')
        .send({ isActive: 'yes', commission: -1 })
        .expect(400);
    },
    security: async () => {
      const ownerId = await seedUser(testApp.database);
      const staffId = await seedUser(testApp.database);
      const managerId = await seedUser(testApp.database);
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const branchId = await seedBranch(testApp.database, restaurantId);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}/status`)
        .set('Idempotency-Key', 'branch-status-no-auth')
        .send({ isActive: false })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}/status`)
        .set(
          'Cookie',
          cookie(ownerId, SystemRole.RESTAURANT_USER, restaurantId),
        )
        .set('Idempotency-Key', 'branch-status-owner-denied')
        .send({ isActive: false })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}/status`)
        .set(
          'Cookie',
          cookie(
            managerId,
            SystemRole.RESTAURANT_USER,
            restaurantId,
            'branch_manager',
            [branchId],
          ),
        )
        .set('Idempotency-Key', 'branch-status-assigned-manager-denied')
        .send({ isActive: false })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}/status`)
        .set(
          'Cookie',
          cookie(staffId, SystemRole.RESTAURANT_USER, restaurantId, 'staff', [
            branchId,
          ]),
        )
        .set('Idempotency-Key', 'branch-status-staff-denied')
        .send({ isActive: false })
        .expect(403);
      await request(testApp.app.getHttpServer())
        .patch(`/api/branches/${branchId}/status`)
        .set(
          'Cookie',
          cookie(
            managerId,
            SystemRole.RESTAURANT_USER,
            restaurantId,
            'branch_manager',
            [],
          ),
        )
        .set('Idempotency-Key', 'branch-status-unassigned-manager')
        .send({ isActive: false })
        .expect(403);
    },
    businessLogic: async () => {
      await request(testApp.app.getHttpServer())
        .patch('/api/branches/999999/status')
        .set('Cookie', cookie(999, SystemRole.SYSTEM_ADMIN))
        .set('Idempotency-Key', 'branch-status-missing')
        .send({ isActive: true })
        .expect(404);
    },
  });
});
