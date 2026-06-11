import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import request from 'supertest';
import { MemberStatus } from 'src/app/rbac/enums';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { seedRestaurant, seedUser } from '../helpers/fixtures';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('Auth HTTP integration completeness matrix', () => {
  const testApp = useCoreIntegrationApp();
  const customerPayload = {
    email: 'new.customer@example.com',
    phone: '01012345678',
    name: 'New Customer',
    password: 'Password123',
    role: SystemRole.CUSTOMER,
  };

  async function seedPasswordUser(
    email: string,
    password = 'Password123',
    overrides: Record<string, unknown> = {},
  ) {
    const userId = await seedUser(testApp.database, {
      email,
      password_hash: await bcrypt.hash(password, 10),
      ...overrides,
    });
    return { userId, password };
  }

  async function seedReset(
    userId: number,
    otp = '654321',
    overrides: Record<string, unknown> = {},
  ) {
    const [reset] = await testApp
      .database('password_resets')
      .insert({
        user_id: userId,
        otp_hash: createHash('sha256').update(otp).digest('hex'),
        expires_at: new Date(Date.now() + 60_000),
        created_at: new Date(),
        ...overrides,
      })
      .returning(['id']);
    return { resetId: Number(reset.id), otp };
  }

  describeEndpoint('POST /api/auth/register', {
    goldenPath: async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'register-golden')
        .send(customerPayload);

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('access_token='),
          expect.stringContaining('refresh_token='),
        ]),
      );
      const user = await testApp
        .database('users')
        .where({ email: customerPayload.email })
        .first();
      expect(user.system_role).toBe(SystemRole.CUSTOMER);
      expect(
        await bcrypt.compare(customerPayload.password, user.password_hash),
      ).toBe(true);
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'register-validation')
        .send({ email: 'invalid', phone: '1', password: 'weak', role: 'bad' })
        .expect(400);
      expect(await testApp.database('users')).toHaveLength(0);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'register-public')
        .send({ ...customerPayload, email: 'public@example.com' })
        .expect(201);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'register-admin-denied')
        .send({
          ...customerPayload,
          email: 'admin-signup@example.com',
          phone: '01012345679',
          role: SystemRole.SYSTEM_ADMIN,
        })
        .expect(403);
    },
    businessLogic: async () => {
      await seedPasswordUser(customerPayload.email, customerPayload.password, {
        phone: customerPayload.phone,
      });
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'register-duplicate')
        .send(customerPayload)
        .expect(409);
      expect(
        await testApp.database('users').where({ email: customerPayload.email }),
      ).toHaveLength(1);
    },
  });

  describeEndpoint('POST /api/auth/login', {
    goldenPath: async () => {
      const { password } = await seedPasswordUser('login@example.com');
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password });

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('access_token=')]),
      );
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'bad', password: 123 })
        .expect(400);
    },
    security: async () => {
      const { password } = await seedPasswordUser('secure-login@example.com');
      await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'secure-login@example.com', password: `${password}x` })
        .expect(401);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password })
        .expect(401);
    },
    businessLogic: async () => {
      const { userId, password } = await seedPasswordUser(
        'restaurant-login@example.com',
        'Password123',
        { system_role: SystemRole.RESTAURANT_USER },
      );
      const restaurantId = await seedRestaurant(testApp.database, userId);
      const [role] = await testApp
        .database('roles')
        .insert({ name: 'owner', display_name: 'Owner' })
        .returning(['id']);
      const [member] = await testApp
        .database('restaurant_members')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId,
          role_id: role.id,
          status: MemberStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(['id']);
      const branchId = Number(
        (
          await testApp
            .database('restaurant_branches')
            .insert({
              restaurant_id: restaurantId,
              country_code: 'EG',
              address_text: 'Login Branch',
              label: 'Login',
              lat: 30,
              lng: 31,
              opens_at: '09:00',
              closes_at: '22:00',
              delivery_radius: 5,
              currency: 'EGP',
              commission: 10,
            })
            .returning(['id'])
        )[0].id,
      );
      await testApp.database('member_branches').insert({
        member_id: member.id,
        branch_id: branchId,
        created_at: new Date(),
      });

      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'restaurant-login@example.com', password });
      expect(response.status).toBe(200);
      const accessCookie = (
        response.headers['set-cookie'] as unknown as string[]
      ).find((value) => value.startsWith('access_token='));
      expect(accessCookie).toBeDefined();
    },
  });

  describeEndpoint('POST /api/auth/forgot-password', {
    goldenPath: async () => {
      const { userId } = await seedPasswordUser('forgot@example.com');
      await request(testApp.app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('Idempotency-Key', 'forgot-golden')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(testApp.emailStub.sentEmails).toHaveLength(1);
      await expect(
        testApp.database('password_resets').where({ user_id: userId }).first(),
      ).resolves.toMatchObject({ consumed_at: null });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('Idempotency-Key', 'forgot-validation')
        .send({ email: 'not-an-email' })
        .expect(400);
    },
    security: async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('Idempotency-Key', 'forgot-enumeration')
        .send({ email: 'unknown@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('If an account exists');
      expect(testApp.emailStub.sentEmails).toHaveLength(0);
      expect(await testApp.database('password_resets')).toHaveLength(0);
    },
    businessLogic: async () => {
      const { userId } = await seedPasswordUser('forgot-repeat@example.com');
      await request(testApp.app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('Idempotency-Key', 'forgot-first')
        .send({ email: 'forgot-repeat@example.com' })
        .expect(200);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('Idempotency-Key', 'forgot-second')
        .send({ email: 'forgot-repeat@example.com' })
        .expect(200);

      expect(
        await testApp.database('password_resets').where({ user_id: userId }),
      ).toHaveLength(2);
    },
  });

  describeEndpoint('POST /api/auth/reset-password', {
    goldenPath: async () => {
      const { userId } = await seedPasswordUser('reset@example.com');
      const { resetId, otp } = await seedReset(userId);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('Idempotency-Key', 'reset-golden')
        .send({
          email: 'reset@example.com',
          otp,
          newPassword: 'NewPassword123',
        })
        .expect(200);

      const user = await testApp
        .database('users')
        .where({ id: userId })
        .first();
      const reset = await testApp
        .database('password_resets')
        .where({ id: resetId })
        .first();
      expect(await bcrypt.compare('NewPassword123', user.password_hash)).toBe(
        true,
      );
      expect(reset.consumed_at).not.toBeNull();
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('Idempotency-Key', 'reset-validation')
        .send({ email: 'bad', otp: '12', newPassword: 'weak' })
        .expect(400);
    },
    security: async () => {
      const { userId } = await seedPasswordUser('reset-security@example.com');
      await seedReset(userId);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('Idempotency-Key', 'reset-wrong-otp')
        .send({
          email: 'reset-security@example.com',
          otp: '111111',
          newPassword: 'NewPassword123',
        })
        .expect(400);

      const user = await testApp
        .database('users')
        .where({ id: userId })
        .first();
      expect(await bcrypt.compare('Password123', user.password_hash)).toBe(
        true,
      );
    },
    businessLogic: async () => {
      const { userId } = await seedPasswordUser('reset-expired@example.com');
      const { otp } = await seedReset(userId, '654321', {
        expires_at: new Date(Date.now() - 1_000),
      });
      await request(testApp.app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('Idempotency-Key', 'reset-expired')
        .send({
          email: 'reset-expired@example.com',
          otp,
          newPassword: 'NewPassword123',
        })
        .expect(400);
    },
  });

  describeEndpoint('POST /api/auth/accept-invite', {
    goldenPath: async () => {
      const { userId } = await seedPasswordUser(
        'invite@example.com',
        'Temp1234',
        {
          system_role: SystemRole.RESTAURANT_USER,
        },
      );
      const ownerId = await seedUser(testApp.database, {
        system_role: SystemRole.RESTAURANT_USER,
      });
      const restaurantId = await seedRestaurant(testApp.database, ownerId);
      const [role] = await testApp
        .database('roles')
        .insert({ name: 'staff', display_name: 'Staff' })
        .returning(['id']);
      const [member] = await testApp
        .database('restaurant_members')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId,
          role_id: role.id,
          status: MemberStatus.INACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(['id']);
      const { otp } = await seedReset(userId);

      await request(testApp.app.getHttpServer())
        .post('/api/auth/accept-invite')
        .set('Idempotency-Key', 'invite-golden')
        .send({
          email: 'invite@example.com',
          otp,
          newPassword: 'AcceptedPassword123',
        })
        .expect(200);
      await expect(
        testApp.database('restaurant_members').where({ id: member.id }).first(),
      ).resolves.toMatchObject({ status: MemberStatus.ACTIVE });
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/accept-invite')
        .set('Idempotency-Key', 'invite-validation')
        .send({ email: 'bad', otp: '1', newPassword: 'weak' })
        .expect(400);
    },
    security: async () => {
      const { userId } = await seedPasswordUser('invite-security@example.com');
      await seedReset(userId);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/accept-invite')
        .set('Idempotency-Key', 'invite-wrong-otp')
        .send({
          email: 'invite-security@example.com',
          otp: '111111',
          newPassword: 'AcceptedPassword123',
        })
        .expect(400);
    },
    businessLogic: async () => {
      const { userId } = await seedPasswordUser('invite-no-member@example.com');
      const { otp } = await seedReset(userId);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/accept-invite')
        .set('Idempotency-Key', 'invite-no-member')
        .send({
          email: 'invite-no-member@example.com',
          otp,
          newPassword: 'AcceptedPassword123',
        })
        .expect(404);

      const reset = await testApp
        .database('password_resets')
        .where({ user_id: userId })
        .first();
      expect(reset.consumed_at).toBeNull();
    },
  });

  describeEndpoint('POST /api/auth/refresh', {
    goldenPath: async () => {
      const registration = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'refresh-register')
        .send({ ...customerPayload, email: 'refresh@example.com' });
      const setCookies = registration.headers['set-cookie'];
      const refreshCookie = (
        Array.isArray(setCookies) ? setCookies : [setCookies]
      ).find((value) => value?.startsWith('refresh_token='));

      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie!);
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('access_token=')]),
      );
    },
    validation: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 123 })
        .expect(401);
    },
    security: async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/refresh')
        .expect(401);
      await request(testApp.app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', 'refresh_token=tampered')
        .expect(401);
    },
    businessLogic: async () => {
      const registration = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .set('Idempotency-Key', 'refresh-deleted-register')
        .send({ ...customerPayload, email: 'refresh-deleted@example.com' });
      const setCookies = registration.headers['set-cookie'];
      const refreshCookie = (
        Array.isArray(setCookies) ? setCookies : [setCookies]
      ).find((value) => value?.startsWith('refresh_token='));
      await testApp
        .database('users')
        .where({ email: 'refresh-deleted@example.com' })
        .del();

      await request(testApp.app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie!)
        .expect(401);
    },
  });
});
