import request from 'supertest';
import { MediaStatus } from 'src/app/media/enums';
import { SystemRole } from 'src/app/user/enums';
import { seedRestaurant, seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Media HTTP integration', () => {
  const testApp = useCoreIntegrationApp();

  function restaurantCookie(
    userId: number,
    restaurantId: number,
    restaurantRole: string,
  ) {
    return testApp.authCookie({
      userId,
      email: `media-${userId}@example.com`,
      role: SystemRole.RESTAURANT_USER,
      restaurantId,
      restaurantRole,
      branchIds: [],
    });
  }

  async function setupRestaurant() {
    await testApp.database('roles').insert([
      {
        name: 'owner',
        display_name: 'Restaurant Owner',
        description: 'Full restaurant access',
      },
      {
        name: 'branch_manager',
        display_name: 'Branch Manager',
        description: 'Branch management access',
      },
      {
        name: 'staff',
        display_name: 'Staff',
        description: 'Limited access',
      },
    ]);
    await testApp.database('permissions').insert([
      { resource: 'core:product', action: 'update' },
      { resource: 'core:restaurant', action: 'update' },
    ]);
    await testApp.database.raw(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles AS r
      CROSS JOIN permissions AS p
      WHERE r.name = 'owner'
         OR (r.name = 'branch_manager' AND p.resource = 'core:product')
    `);

    const ownerId = await seedUser(testApp.database, {
      system_role: SystemRole.RESTAURANT_USER,
    });
    const restaurantId = await seedRestaurant(testApp.database, ownerId);
    return { ownerId, restaurantId };
  }

  it('allows an owner to request and confirm a product image upload', async () => {
    const { ownerId, restaurantId } = await setupRestaurant();
    const presign = await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/product-images/presigned-url`,
      )
      .set('Cookie', restaurantCookie(ownerId, restaurantId, 'owner'))
      .send({ contentType: 'image/jpeg' })
      .expect(201);

    expect(presign.body.data).toMatchObject({
      mediaId: expect.any(Number),
      uploadUrl: expect.any(String),
      publicUrl: expect.stringContaining(
        `/restaurant/${restaurantId}/product_image/`,
      ),
      uploadHeaders: { 'Content-Type': 'image/jpeg' },
    });

    testApp.s3Stub.setObject(presign.body.data.path, {
      contentType: 'image/jpeg',
      contentLength: 120,
    });
    const confirmation = await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/${presign.body.data.mediaId}/confirm`,
      )
      .set('Cookie', restaurantCookie(ownerId, restaurantId, 'owner'))
      .expect(201);

    expect(confirmation.body.data.status).toBe(MediaStatus.COMPLETED);
    await expect(
      testApp
        .database('media')
        .where({ id: presign.body.data.mediaId })
        .first(),
    ).resolves.toMatchObject({ status: MediaStatus.COMPLETED });
  });

  it('allows branch managers only for product images', async () => {
    const { restaurantId } = await setupRestaurant();
    const managerId = await seedUser(testApp.database, {
      system_role: SystemRole.RESTAURANT_USER,
    });
    const managerCookie = restaurantCookie(
      managerId,
      restaurantId,
      'branch_manager',
    );

    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/product-images/presigned-url`,
      )
      .set('Cookie', managerCookie)
      .send({ contentType: 'image/png' })
      .expect(201);

    await request(testApp.app.getHttpServer())
      .post(`/api/restaurants/${restaurantId}/media/logo/presigned-url`)
      .set('Cookie', managerCookie)
      .send({ contentType: 'image/png' })
      .expect(403);
  });

  it('allows owners and system administrators to request logo uploads', async () => {
    const { ownerId, restaurantId } = await setupRestaurant();
    const adminId = await seedUser(testApp.database, {
      system_role: SystemRole.SYSTEM_ADMIN,
    });

    await request(testApp.app.getHttpServer())
      .post(`/api/restaurants/${restaurantId}/media/logo/presigned-url`)
      .set('Cookie', restaurantCookie(ownerId, restaurantId, 'owner'))
      .send({ contentType: 'image/webp' })
      .expect(201);

    await request(testApp.app.getHttpServer())
      .post(`/api/restaurants/${restaurantId}/media/logo/presigned-url`)
      .set(
        'Cookie',
        testApp.authCookie({
          userId: adminId,
          email: 'admin@example.com',
          role: SystemRole.SYSTEM_ADMIN,
        }),
      )
      .send({ contentType: 'image/webp' })
      .expect(201);
  });

  it('rejects staff, customers, and cross-restaurant users', async () => {
    const { restaurantId } = await setupRestaurant();
    const staffId = await seedUser(testApp.database, {
      system_role: SystemRole.RESTAURANT_USER,
    });

    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/product-images/presigned-url`,
      )
      .set('Cookie', restaurantCookie(staffId, restaurantId, 'staff'))
      .send({ contentType: 'image/jpeg' })
      .expect(403);

    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/product-images/presigned-url`,
      )
      .set(
        'Cookie',
        testApp.authCookie({
          userId: staffId,
          email: 'customer@example.com',
          role: SystemRole.CUSTOMER,
        }),
      )
      .send({ contentType: 'image/jpeg' })
      .expect(403);

    const otherOwnerId = await seedUser(testApp.database, {
      system_role: SystemRole.RESTAURANT_USER,
    });
    const otherRestaurantId = await seedRestaurant(
      testApp.database,
      otherOwnerId,
    );
    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/product-images/presigned-url`,
      )
      .set('Cookie', restaurantCookie(otherOwnerId, otherRestaurantId, 'owner'))
      .send({ contentType: 'image/jpeg' })
      .expect(403);
  });

  it('does not confirm a missing object or another uploader’s media', async () => {
    const { ownerId, restaurantId } = await setupRestaurant();
    const presign = await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/product-images/presigned-url`,
      )
      .set('Cookie', restaurantCookie(ownerId, restaurantId, 'owner'))
      .send({ contentType: 'image/jpeg' })
      .expect(201);

    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/${presign.body.data.mediaId}/confirm`,
      )
      .set('Cookie', restaurantCookie(ownerId, restaurantId, 'owner'))
      .expect(400);

    const otherUserId = await seedUser(testApp.database, {
      system_role: SystemRole.RESTAURANT_USER,
    });
    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/${presign.body.data.mediaId}/confirm`,
      )
      .set('Cookie', restaurantCookie(otherUserId, restaurantId, 'owner'))
      .expect(403);
  });

  it('allows a restaurant logo to be applied only after confirmation', async () => {
    const { ownerId, restaurantId } = await setupRestaurant();
    const ownerCookie = restaurantCookie(ownerId, restaurantId, 'owner');
    const presign = await request(testApp.app.getHttpServer())
      .post(`/api/restaurants/${restaurantId}/media/logo/presigned-url`)
      .set('Cookie', ownerCookie)
      .send({ contentType: 'image/png' })
      .expect(201);

    await request(testApp.app.getHttpServer())
      .patch(`/api/restaurants/${restaurantId}`)
      .set('Cookie', ownerCookie)
      .set('Idempotency-Key', 'pending-restaurant-logo')
      .send({ logoURL: presign.body.data.publicUrl })
      .expect(400);

    testApp.s3Stub.setObject(presign.body.data.path, {
      contentType: 'image/png',
      contentLength: 200,
    });
    await request(testApp.app.getHttpServer())
      .post(
        `/api/restaurants/${restaurantId}/media/${presign.body.data.mediaId}/confirm`,
      )
      .set('Cookie', ownerCookie)
      .expect(201);

    await request(testApp.app.getHttpServer())
      .patch(`/api/restaurants/${restaurantId}`)
      .set('Cookie', ownerCookie)
      .set('Idempotency-Key', 'confirmed-restaurant-logo')
      .send({ logoURL: presign.body.data.publicUrl })
      .expect(200);

    await expect(
      testApp.database('restaurants').where({ id: restaurantId }).first(),
    ).resolves.toMatchObject({ logo_url: presign.body.data.publicUrl });
  });
});
