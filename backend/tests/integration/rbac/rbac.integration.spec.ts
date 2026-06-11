import request from 'supertest';
import { MemberStatus } from 'src/app/rbac/enums';
import { PermissionCacheService } from 'src/app/rbac/permission-cache.service';
import { SystemRole } from 'src/app/user/enums';
import { describeEndpoint } from '../helpers/completeness-matrix';
import { useCoreIntegrationApp } from '../helpers/test-app';

describe('RBAC HTTP integration', () => {
  const testApp = useCoreIntegrationApp();
  let ownerUserId: number;
  let ownerMemberId: number;
  let restaurantId: number;
  let otherRestaurantId: number;
  let branchId: number;
  let otherBranchId: number;
  let roleIds: Record<string, number>;
  let ownerCookie: string;
  let wrongWorkspaceCookie: string;
  let customerCookie: string;
  let phoneSequence = 10;

  beforeEach(async () => {
    const now = new Date('2026-06-01T10:00:00.000Z');
    const roles = await testApp
      .database('roles')
      .insert([
        {
          name: 'owner',
          display_name: 'Restaurant Owner',
          description: 'Full access',
        },
        {
          name: 'branch_manager',
          display_name: 'Branch Manager',
          description: 'Branch access',
        },
        {
          name: 'staff',
          display_name: 'Staff',
          description: 'Read access',
        },
      ])
      .returning(['id', 'name']);
    roleIds = Object.fromEntries(
      roles.map((role) => [role.name, Number(role.id)]),
    );

    const permissions = await testApp
      .database('permissions')
      .insert(
        ['create', 'read', 'update', 'delete'].map((action) => ({
          resource: 'core:member',
          action,
          created_at: now,
        })),
      )
      .returning(['id', 'action']);

    await testApp.database('role_permissions').insert([
      ...permissions.map((permission) => ({
        role_id: roleIds.owner,
        permission_id: permission.id,
        created_at: now,
      })),
      {
        role_id: roleIds.branch_manager,
        permission_id: permissions.find(
          (permission) => permission.action === 'read',
        )!.id,
        created_at: now,
      },
      {
        role_id: roleIds.staff,
        permission_id: permissions.find(
          (permission) => permission.action === 'read',
        )!.id,
        created_at: now,
      },
    ]);

    const [owner] = await testApp
      .database('users')
      .insert({
        email: 'owner@example.com',
        phone: '01000000001',
        name: 'Owner',
        password_hash: 'hash',
        system_role: SystemRole.RESTAURANT_USER,
        created_at: now,
        updated_at: now,
      })
      .returning(['id']);
    ownerUserId = Number(owner.id);

    const restaurants = await testApp
      .database('restaurants')
      .insert([
        {
          owner_id: ownerUserId,
          name: 'Main Restaurant',
          logo_url: 'https://cdn.test/main.png',
          status: 'active',
          primary_country: 'EG',
        },
        {
          owner_id: ownerUserId,
          name: 'Other Restaurant',
          logo_url: 'https://cdn.test/other.png',
          status: 'active',
          primary_country: 'EG',
        },
      ])
      .returning(['id']);
    restaurantId = Number(restaurants[0].id);
    otherRestaurantId = Number(restaurants[1].id);

    const [ownerMembership] = await testApp
      .database('restaurant_members')
      .insert({
        restaurant_id: restaurantId,
        user_id: ownerUserId,
        role_id: roleIds.owner,
        status: MemberStatus.ACTIVE,
        created_at: now,
        updated_at: now,
      })
      .returning(['id']);
    ownerMemberId = Number(ownerMembership.id);

    const branches = await testApp
      .database('restaurant_branches')
      .insert([
        {
          restaurant_id: restaurantId,
          country_code: 'EG',
          address_text: '1 Main Street',
          label: 'Main',
          lat: 30.0444,
          lng: 31.2357,
          opens_at: '09:00',
          closes_at: '23:00',
          delivery_radius: 5000,
          currency: 'EGP',
          commission: 10,
        },
        {
          restaurant_id: otherRestaurantId,
          country_code: 'EG',
          address_text: '2 Other Street',
          label: 'Other',
          lat: 30.05,
          lng: 31.24,
          opens_at: '09:00',
          closes_at: '23:00',
          delivery_radius: 5000,
          currency: 'EGP',
          commission: 10,
        },
      ])
      .returning(['id']);
    branchId = Number(branches[0].id);
    otherBranchId = Number(branches[1].id);

    testApp.app.get(PermissionCacheService).clearCache();
    ownerCookie = restaurantCookie('owner', restaurantId);
    wrongWorkspaceCookie = restaurantCookie('owner', otherRestaurantId);
    customerCookie = testApp.authCookie({
      userId: ownerUserId,
      email: 'customer@example.com',
      role: SystemRole.CUSTOMER,
    });
  });

  function restaurantCookie(role: string, workspaceId: number) {
    return testApp.authCookie({
      userId: ownerUserId,
      email: 'owner@example.com',
      role: SystemRole.RESTAURANT_USER,
      restaurantId: workspaceId,
      restaurantRole: role,
      branchIds: [],
    });
  }

  function validInvitation(overrides: Record<string, unknown> = {}) {
    return {
      email: 'invited@example.com',
      name: 'Invited Member',
      phoneNumber: '01000000004',
      role: 'staff',
      branchIds: [branchId],
      ...overrides,
    };
  }

  async function seedMember(
    options: {
      email?: string;
      role?: string;
      status?: MemberStatus;
      targetRestaurantId?: number;
    } = {},
  ) {
    const now = new Date('2026-06-01T11:00:00.000Z');
    phoneSequence += 1;
    const email = options.email ?? `member-${phoneSequence}@example.com`;
    const targetRestaurantId = options.targetRestaurantId ?? restaurantId;
    const [user] = await testApp
      .database('users')
      .insert({
        email,
        phone: `01000000${String(phoneSequence).padStart(3, '0')}`,
        name: 'Team Member',
        password_hash: 'hash',
        system_role: SystemRole.RESTAURANT_USER,
        created_at: now,
        updated_at: now,
      })
      .returning(['id']);
    const [member] = await testApp
      .database('restaurant_members')
      .insert({
        restaurant_id: targetRestaurantId,
        user_id: user.id,
        role_id: roleIds[options.role ?? 'staff'],
        status: options.status ?? MemberStatus.INACTIVE,
        created_at: now,
        updated_at: now,
      })
      .returning(['id']);

    return {
      userId: Number(user.id),
      memberId: Number(member.id),
    };
  }

  describeEndpoint('GET /api/roles/:role/permissions', {
    goldenPath: async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/roles/owner/permissions')
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        role: 'owner',
        permissions: expect.arrayContaining([
          'core:member:create',
          'core:member:read',
          'core:member:update',
          'core:member:delete',
        ]),
      });
    },
    validation: async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/roles/not%20a%20role!/permissions')
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(400);
    },
    security: async () => {
      const unauthenticated = await request(testApp.app.getHttpServer()).get(
        '/api/roles/owner/permissions',
      );
      const wrongRole = await request(testApp.app.getHttpServer())
        .get('/api/roles/owner/permissions')
        .set('Cookie', customerCookie);

      expect(unauthenticated.status).toBe(401);
      expect(wrongRole.status).toBe(403);
    },
    businessLogic: async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/roles/missing_role/permissions')
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(404);
    },
  });

  describeEndpoint('POST /api/restaurants/:restaurantId/members', {
    goldenPath: async () => {
      const response = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', ownerCookie)
        .send(validInvitation());

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Member invited successfully');

      const user = await testApp
        .database('users')
        .where({ email: 'invited@example.com' })
        .first();
      const member = await testApp
        .database('restaurant_members')
        .where({ user_id: user.id })
        .first();
      const assignedBranches = await testApp
        .database('member_branches')
        .where({ member_id: member.id });
      const reset = await testApp
        .database('password_resets')
        .where({ user_id: user.id })
        .first();

      expect(member).toMatchObject({
        restaurant_id: String(restaurantId),
        role_id: roleIds.staff,
        status: MemberStatus.INACTIVE,
      });
      expect(assignedBranches).toEqual([
        expect.objectContaining({ branch_id: String(branchId) }),
      ]);
      expect(reset.otp_hash).toMatch(/^[a-f0-9]{64}$/);
      expect(testApp.emailStub.sentEmails).toEqual([
        expect.objectContaining({ to: 'invited@example.com' }),
      ]);
    },
    validation: async () => {
      const response = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', ownerCookie)
        .send(
          validInvitation({
            email: 'invalid',
            name: '',
            phoneNumber: 123,
            branchIds: [-1, 'bad'],
          }),
        );

      expect(response.status).toBe(400);
      await expect(
        testApp.database('users').where({ email: 'invalid' }).first(),
      ).resolves.toBeUndefined();
    },
    security: async () => {
      const unauthenticated = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .send(validInvitation());
      const wrongRole = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', restaurantCookie('staff', restaurantId))
        .send(validInvitation());
      const crossTenant = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', wrongWorkspaceCookie)
        .send(validInvitation());

      expect(unauthenticated.status).toBe(401);
      expect(wrongRole.status).toBe(403);
      expect(crossTenant.status).toBe(403);
    },
    businessLogic: async () => {
      const ownerRole = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', ownerCookie)
        .send(validInvitation({ role: 'owner' }));

      await seedMember({ email: 'duplicate@example.com' });
      const duplicate = await request(testApp.app.getHttpServer())
        .post(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', ownerCookie)
        .send(
          validInvitation({
            email: 'duplicate@example.com',
            phoneNumber: '01000000999',
          }),
        );

      expect(ownerRole.status).toBe(403);
      expect(duplicate.status).toBe(409);
    },
  });

  describeEndpoint('GET /api/restaurants/:restaurantId/members', {
    goldenPath: async () => {
      const { userId, memberId } = await seedMember({
        email: 'listed@example.com',
        status: MemberStatus.ACTIVE,
      });

      const response = await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: String(memberId),
            userId: String(userId),
            email: 'listed@example.com',
            role: 'staff',
            status: MemberStatus.ACTIVE,
          }),
        ]),
      );
    },
    validation: async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/restaurants/not-an-id/members')
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(400);
    },
    security: async () => {
      const unauthenticated = await request(testApp.app.getHttpServer()).get(
        `/api/restaurants/${restaurantId}/members`,
      );
      const wrongRole = await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', customerCookie);
      const crossTenant = await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', wrongWorkspaceCookie);

      expect(unauthenticated.status).toBe(401);
      expect(wrongRole.status).toBe(403);
      expect(crossTenant.status).toBe(403);
    },
    businessLogic: async () => {
      const foreign = await seedMember({
        email: 'foreign@example.com',
        targetRestaurantId: otherRestaurantId,
      });

      const response = await request(testApp.app.getHttpServer())
        .get(`/api/restaurants/${restaurantId}/members`)
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(200);
      expect(response.body.data).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: String(foreign.memberId) }),
        ]),
      );
    },
  });

  describeEndpoint('PATCH /api/restaurants/:restaurantId/members/:memberId', {
    goldenPath: async () => {
      const { memberId } = await seedMember();

      const response = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${memberId}`)
        .set('Cookie', ownerCookie)
        .send({
          role: 'branch_manager',
          status: MemberStatus.SUSPENDED,
        });

      expect(response.status).toBe(200);
      await expect(
        testApp.database('restaurant_members').where({ id: memberId }).first(),
      ).resolves.toMatchObject({
        role_id: roleIds.branch_manager,
        status: MemberStatus.SUSPENDED,
      });
    },
    validation: async () => {
      const response = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/not-an-id`)
        .set('Cookie', ownerCookie)
        .send({ role: '', status: 'deleted' });

      expect(response.status).toBe(400);
    },
    security: async () => {
      const local = await seedMember();
      const foreign = await seedMember({
        targetRestaurantId: otherRestaurantId,
      });
      const unauthenticated = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${local.memberId}`)
        .send({ status: MemberStatus.ACTIVE });
      const staffDenied = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${local.memberId}`)
        .set('Cookie', restaurantCookie('staff', restaurantId))
        .send({ status: MemberStatus.ACTIVE });
      const managerDenied = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${local.memberId}`)
        .set('Cookie', restaurantCookie('branch_manager', restaurantId))
        .send({ status: MemberStatus.ACTIVE });
      const crossTenant = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${foreign.memberId}`)
        .set('Cookie', ownerCookie)
        .send({ status: MemberStatus.ACTIVE });

      expect(unauthenticated.status).toBe(401);
      expect(staffDenied.status).toBe(403);
      expect(managerDenied.status).toBe(403);
      expect(crossTenant.status).toBe(403);
    },
    businessLogic: async () => {
      const { memberId } = await seedMember();
      const ownerRole = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${memberId}`)
        .set('Cookie', ownerCookie)
        .send({ role: 'owner' });
      const missingRole = await request(testApp.app.getHttpServer())
        .patch(`/api/restaurants/${restaurantId}/members/${memberId}`)
        .set('Cookie', ownerCookie)
        .send({ role: 'missing_role' });

      expect(ownerRole.status).toBe(403);
      expect(missingRole.status).toBe(404);
    },
  });

  describeEndpoint('DELETE /api/restaurants/:restaurantId/members/:memberId', {
    goldenPath: async () => {
      const { memberId } = await seedMember();
      await testApp.database('member_branches').insert({
        member_id: memberId,
        branch_id: branchId,
        created_at: new Date(),
      });

      const response = await request(testApp.app.getHttpServer())
        .delete(`/api/restaurants/${restaurantId}/members/${memberId}`)
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(200);
      await expect(
        testApp.database('restaurant_members').where({ id: memberId }).first(),
      ).resolves.toBeUndefined();
      await expect(
        testApp.database('member_branches').where({ member_id: memberId }),
      ).resolves.toEqual([]);
    },
    validation: async () => {
      const response = await request(testApp.app.getHttpServer())
        .delete(`/api/restaurants/${restaurantId}/members/not-an-id`)
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(400);
    },
    security: async () => {
      const local = await seedMember();
      const foreign = await seedMember({
        targetRestaurantId: otherRestaurantId,
      });
      const unauthenticated = await request(testApp.app.getHttpServer()).delete(
        `/api/restaurants/${restaurantId}/members/${local.memberId}`,
      );
      const staffDenied = await request(testApp.app.getHttpServer())
        .delete(`/api/restaurants/${restaurantId}/members/${local.memberId}`)
        .set('Cookie', restaurantCookie('staff', restaurantId));
      const managerDenied = await request(testApp.app.getHttpServer())
        .delete(`/api/restaurants/${restaurantId}/members/${local.memberId}`)
        .set('Cookie', restaurantCookie('branch_manager', restaurantId));
      const crossTenant = await request(testApp.app.getHttpServer())
        .delete(`/api/restaurants/${restaurantId}/members/${foreign.memberId}`)
        .set('Cookie', ownerCookie);

      expect(unauthenticated.status).toBe(401);
      expect(staffDenied.status).toBe(403);
      expect(managerDenied.status).toBe(403);
      expect(crossTenant.status).toBe(403);
    },
    businessLogic: async () => {
      const response = await request(testApp.app.getHttpServer())
        .delete(`/api/restaurants/${restaurantId}/members/${ownerMemberId}`)
        .set('Cookie', ownerCookie);

      expect(response.status).toBe(403);
      await expect(
        testApp
          .database('restaurant_members')
          .where({ id: ownerMemberId })
          .first(),
      ).resolves.toBeDefined();
    },
  });

  describeEndpoint(
    'PUT /api/restaurants/:restaurantId/members/:memberId/branches',
    {
      goldenPath: async () => {
        const { memberId } = await seedMember();

        const response = await request(testApp.app.getHttpServer())
          .put(`/api/restaurants/${restaurantId}/members/${memberId}/branches`)
          .set('Cookie', ownerCookie)
          .send({ branchIds: [branchId] });

        expect(response.status).toBe(200);
        await expect(
          testApp.database('member_branches').where({ member_id: memberId }),
        ).resolves.toEqual([
          expect.objectContaining({ branch_id: String(branchId) }),
        ]);
      },
      validation: async () => {
        const { memberId } = await seedMember();
        const response = await request(testApp.app.getHttpServer())
          .put(`/api/restaurants/${restaurantId}/members/${memberId}/branches`)
          .set('Cookie', ownerCookie)
          .send({ branchIds: [-1, 'bad', branchId, branchId] });

        expect(response.status).toBe(400);
        await expect(
          testApp.database('member_branches').where({ member_id: memberId }),
        ).resolves.toEqual([]);
      },
      security: async () => {
        const foreign = await seedMember({
          targetRestaurantId: otherRestaurantId,
        });
        const unauthenticated = await request(testApp.app.getHttpServer())
          .put(
            `/api/restaurants/${restaurantId}/members/${foreign.memberId}/branches`,
          )
          .send({ branchIds: [branchId] });
        const wrongRole = await request(testApp.app.getHttpServer())
          .put(
            `/api/restaurants/${restaurantId}/members/${foreign.memberId}/branches`,
          )
          .set('Cookie', restaurantCookie('staff', restaurantId))
          .send({ branchIds: [branchId] });
        const crossTenant = await request(testApp.app.getHttpServer())
          .put(
            `/api/restaurants/${restaurantId}/members/${foreign.memberId}/branches`,
          )
          .set('Cookie', ownerCookie)
          .send({ branchIds: [branchId] });

        expect(unauthenticated.status).toBe(401);
        expect(wrongRole.status).toBe(403);
        expect(crossTenant.status).toBe(403);
      },
      businessLogic: async () => {
        const { memberId } = await seedMember();
        const foreignBranch = await request(testApp.app.getHttpServer())
          .put(`/api/restaurants/${restaurantId}/members/${memberId}/branches`)
          .set('Cookie', ownerCookie)
          .send({ branchIds: [otherBranchId] });
        const ownerRestriction = await request(testApp.app.getHttpServer())
          .put(
            `/api/restaurants/${restaurantId}/members/${ownerMemberId}/branches`,
          )
          .set('Cookie', ownerCookie)
          .send({ branchIds: [branchId] });

        expect(foreignBranch.status).toBe(403);
        expect(ownerRestriction.status).toBe(403);
      },
    },
  );
});
