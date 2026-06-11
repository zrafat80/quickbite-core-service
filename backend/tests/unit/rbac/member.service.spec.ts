import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUtilsService } from 'src/app/auth/auth-utils.service';
import { BranchService } from 'src/app/branch/branch.service';
import { MemberStatus } from 'src/app/rbac/enums';
import { MemberService } from 'src/app/rbac/member.service';
import { MemberBranchRepository } from 'src/app/rbac/repository/member-branch.repository';
import { PermissionRepo } from 'src/app/rbac/repository/permission.repository';
import { RestaurantMemberRepository } from 'src/app/rbac/repository/restaurant-member.repository';
import { RoleRepository } from 'src/app/rbac/repository/role.repository';
import { UserService } from 'src/app/user/user.service';
import { IEmailProvider } from 'src/lib/email/email.interface';
import { createTransactionMock } from '../helpers/test-doubles';

describe('MemberService', () => {
  const auth = {} as AuthService;
  const authUtils = { generateAndSaveOTP: jest.fn() };
  const branches = { verifyBranchesBelongToRestaurant: jest.fn() };
  const users = { hashAndCreateUser: jest.fn() };
  const roles = {
    findRoleByName: jest.fn(),
    findRoleIdByName: jest.fn(),
  };
  const members = {
    createRestaurantMember: jest.fn(),
    findMembersByRestaurantId: jest.fn(),
    findMemberWithRoleName: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(),
    activateMemberByUserId: jest.fn(),
    findRestaurantMemberWithRole: jest.fn(),
  };
  const memberBranches = {
    setMemberBranches: jest.fn(),
    findBranchIdsByMemberId: jest.fn(),
  };
  const permissions = { getPermissionsByRoleName: jest.fn() };
  const transaction = createTransactionMock();
  const knex = {
    transaction: jest.fn().mockResolvedValue(transaction),
  };
  const email = { send: jest.fn().mockResolvedValue(undefined) };
  const service = new MemberService(
    auth,
    authUtils as unknown as AuthUtilsService,
    branches as unknown as BranchService,
    users as unknown as UserService,
    roles as unknown as RoleRepository,
    members as unknown as RestaurantMemberRepository,
    memberBranches as unknown as MemberBranchRepository,
    permissions as unknown as PermissionRepo,
    knex as unknown as Knex,
    email as IEmailProvider,
  );
  const member = {
    id: 4,
    restaurantId: 5,
    userId: 7,
    roleId: 2,
    status: MemberStatus.ACTIVE,
  };

  it('creates an active owner member', async () => {
    roles.findRoleByName.mockResolvedValue(1);
    members.createRestaurantMember.mockResolvedValue(member);

    await expect(service.createOwnerMember(5, 7)).resolves.toBe(member);
    expect(members.createRestaurantMember).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: 5,
        userId: 7,
        roleId: 1,
        status: MemberStatus.ACTIVE,
      }),
      undefined,
    );
  });

  it('rejects owner creation when the role is missing', async () => {
    roles.findRoleByName.mockResolvedValue(undefined);
    await expect(service.createOwnerMember(5, 7)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('invites a member with branch access and commits before emailing', async () => {
    roles.findRoleByName.mockResolvedValue(2);
    branches.verifyBranchesBelongToRestaurant.mockResolvedValue(true);
    users.hashAndCreateUser.mockResolvedValue({
      id: 7,
      email: 'member@example.com',
    });
    members.createRestaurantMember.mockResolvedValue(member);
    authUtils.generateAndSaveOTP.mockResolvedValue('123456');

    await expect(
      service.createMember(5, {
        email: 'member@example.com',
        name: 'Member',
        phoneNumber: '01000000000',
        role: 'manager',
        branchIds: [2, 3],
      }),
    ).resolves.toEqual({
      message: 'Member invited successfully',
      data: member,
    });
    expect(memberBranches.setMemberBranches).toHaveBeenCalledWith(
      4,
      [2, 3],
      expect.any(Date),
      transaction,
    );
    expect(transaction.commit).toHaveBeenCalled();
    expect(email.send).toHaveBeenCalledWith(
      'member@example.com',
      expect.any(String),
      expect.stringContaining('123456'),
    );
  });

  it('validates invited roles and branch ownership', async () => {
    await expect(
      service.createMember(5, { role: 'owner' } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);

    roles.findRoleByName.mockResolvedValue(undefined);
    await expect(
      service.createMember(5, { role: 'unknown' } as never),
    ).rejects.toBeInstanceOf(NotFoundException);

    roles.findRoleByName.mockResolvedValue(2);
    branches.verifyBranchesBelongToRestaurant.mockResolvedValue(false);
    await expect(
      service.createMember(5, {
        role: 'manager',
        branchIds: [99],
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rolls back failed invitations', async () => {
    roles.findRoleByName.mockResolvedValue(2);
    users.hashAndCreateUser.mockRejectedValue(new Error('user failed'));

    await expect(
      service.createMember(5, {
        role: 'manager',
        branchIds: [],
      } as never),
    ).rejects.toThrow('user failed');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('lists members', async () => {
    members.findMembersByRestaurantId.mockResolvedValue([member]);
    await expect(service.listMembers(5)).resolves.toEqual([member]);
  });

  it('updates a member role and status', async () => {
    members.findMemberWithRoleName.mockResolvedValue({
      member,
      roleName: 'manager',
    });
    roles.findRoleIdByName.mockResolvedValue(3);

    await expect(
      service.updateMember(5, 4, {
        role: 'staff',
        status: MemberStatus.ACTIVE,
      }),
    ).resolves.toEqual({ message: 'Member updated successfully' });
    expect(members.updateMember).toHaveBeenCalledWith(4, {
      roleId: 3,
      status: MemberStatus.ACTIVE,
    });
  });

  it('rejects invalid member updates', async () => {
    members.findMemberWithRoleName.mockResolvedValueOnce(undefined);
    await expect(service.updateMember(5, 99, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );

    members.findMemberWithRoleName.mockResolvedValue({
      member: { ...member, restaurantId: 6 },
      roleName: 'manager',
    });
    await expect(service.updateMember(5, 4, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    members.findMemberWithRoleName.mockResolvedValue({
      member,
      roleName: 'manager',
    });
    await expect(
      service.updateMember(5, 4, { role: 'owner' }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    roles.findRoleIdByName.mockResolvedValue(undefined);
    await expect(
      service.updateMember(5, 4, { role: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes non-owner members in the same restaurant', async () => {
    members.findMemberWithRoleName.mockResolvedValue({
      member,
      roleName: 'manager',
    });
    await expect(service.deleteMember(5, 4)).resolves.toEqual({
      message: 'Member deleted successfully',
    });

    members.findMemberWithRoleName.mockResolvedValue({
      member,
      roleName: 'owner',
    });
    await expect(service.deleteMember(5, 4)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('updates validated member branches and protects owners', async () => {
    members.findMemberWithRoleName.mockResolvedValue({
      member,
      roleName: 'manager',
    });
    branches.verifyBranchesBelongToRestaurant.mockResolvedValue(true);

    await expect(
      service.updateMemberBranches(5, 4, { branchIds: [2] }),
    ).resolves.toEqual({
      message: 'Member branches access updated successfully',
    });
    expect(memberBranches.setMemberBranches).toHaveBeenCalledWith(4, [2]);

    members.findMemberWithRoleName.mockResolvedValue({
      member,
      roleName: 'owner',
    });
    await expect(
      service.updateMemberBranches(5, 4, { branchIds: [] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns permissions and delegates membership lookups', async () => {
    permissions.getPermissionsByRoleName.mockResolvedValue(['orders:read']);
    members.activateMemberByUserId.mockResolvedValue(member);
    members.findRestaurantMemberWithRole.mockResolvedValue({
      member,
      roleName: 'manager',
    });
    memberBranches.findBranchIdsByMemberId.mockResolvedValue([2, 3]);

    await expect(service.getRolePermissions('manager')).resolves.toEqual({
      role: 'manager',
      permissions: ['orders:read'],
    });
    await expect(service.activateInvite(7)).resolves.toBe(member);
    await expect(
      service.findRestaurantMemberWithRole(7),
    ).resolves.toMatchObject({
      roleName: 'manager',
    });
    await expect(service.findBranchIdsByMemberId(4)).resolves.toEqual([2, 3]);
  });
});
