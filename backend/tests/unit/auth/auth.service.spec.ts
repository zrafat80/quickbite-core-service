import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUtilsService } from 'src/app/auth/auth-utils.service';
import { PasswordResetRepository } from 'src/app/auth/repository/password-reset.repository';
import { MemberService } from 'src/app/rbac/member.service';
import { RestaurantService } from 'src/app/restaurant/restaurant.service';
import { SystemRole } from 'src/app/user/enums';
import { User } from 'src/app/user/entity/user.entity';
import { UserService } from 'src/app/user/user.service';
import { IEmailProvider } from 'src/lib/email/email.interface';
import { Knex } from 'knex';

describe('AuthService login', () => {
  const transaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  const knex = {
    transaction: jest.fn().mockResolvedValue(transaction),
  } as unknown as Knex;
  const userService = {
    findUserByEmail: jest.fn(),
    hashAndCreateUser: jest.fn(),
    updatePassword: jest.fn(),
    getByUserId: jest.fn(),
  };
  const authUtils = {
    comparePassword: jest.fn(),
    createAccessToken: jest.fn(),
    createRefreshToken: jest.fn(),
    generateAndSaveOTP: jest.fn(),
    hashOTP: jest.fn(),
    hashPassword: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };
  const memberService = {
    findRestaurantMemberWithRole: jest.fn(),
    findBranchIdsByMemberId: jest.fn(),
    createOwnerMember: jest.fn(),
    activateInvite: jest.fn(),
  };
  const passwordResetRepo = {
    findLatestPasswordResetByUserId: jest.fn(),
    updatePasswordResetConsumedAt: jest.fn(),
  };
  const emailProvider = {
    send: jest.fn(),
  };
  const restaurantService = {
    create: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(
      knex,
      userService as unknown as UserService,
      authUtils as unknown as AuthUtilsService,
      memberService as unknown as MemberService,
      passwordResetRepo as unknown as PasswordResetRepository,
      emailProvider as IEmailProvider,
      restaurantService as unknown as RestaurantService,
    );
  });

  it('rejects login when the email does not exist', async () => {
    // Arrange
    userService.findUserByEmail.mockResolvedValue(undefined);

    // Act
    const result = service.login({
      email: 'missing@example.com',
      password: 'Password123',
    });

    // Assert
    await expect(result).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authUtils.comparePassword).not.toHaveBeenCalled();
  });

  it('rejects login when the password is incorrect', async () => {
    // Arrange
    const user = new User({
      id: 1,
      email: 'customer@example.com',
      phone: '01012345678',
      name: 'Customer',
      passwordHash: 'stored-hash',
      systemRole: SystemRole.CUSTOMER,
    });
    userService.findUserByEmail.mockResolvedValue(user);
    authUtils.comparePassword.mockResolvedValue(false);

    // Act
    const result = service.login({
      email: user.email,
      password: 'WrongPassword123',
    });

    // Assert
    await expect(result).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authUtils.createAccessToken).not.toHaveBeenCalled();
    expect(authUtils.createRefreshToken).not.toHaveBeenCalled();
  });

  it('returns tokens and sanitized user data for valid credentials', async () => {
    // Arrange
    const user = new User({
      id: 7,
      email: 'customer@example.com',
      phone: '01012345678',
      name: 'Customer',
      passwordHash: 'stored-hash',
      systemRole: SystemRole.CUSTOMER,
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
    });
    userService.findUserByEmail.mockResolvedValue(user);
    authUtils.comparePassword.mockResolvedValue(true);
    authUtils.createAccessToken.mockReturnValue('access-token');
    authUtils.createRefreshToken.mockReturnValue('refresh-token');

    // Act
    const result = await service.login({
      email: user.email,
      password: 'Password123',
    });

    // Assert
    expect(result).toEqual({
      message: 'Login successful',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
    });
    expect(memberService.findRestaurantMemberWithRole).not.toHaveBeenCalled();
  });

  it('adds restaurant membership claims when a restaurant user logs in', async () => {
    const user = new User({
      id: 9,
      email: 'member@example.com',
      phone: '01012345678',
      name: 'Member',
      passwordHash: 'stored-hash',
      systemRole: SystemRole.RESTAURANT_USER,
    });
    userService.findUserByEmail.mockResolvedValue(user);
    authUtils.comparePassword.mockResolvedValue(true);
    memberService.findRestaurantMemberWithRole.mockResolvedValue({
      member: { id: 22, restaurantId: 5 },
      roleName: 'manager',
    });
    memberService.findBranchIdsByMemberId.mockResolvedValue([2, 3]);

    await service.login({ email: user.email, password: 'Password123' });

    expect(authUtils.createAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: 5,
        restaurantRole: 'manager',
        branchIds: [2, 3],
      }),
    );
  });

  it('registers a customer and commits the transaction', async () => {
    const user = new User({
      id: 10,
      email: 'new@example.com',
      phone: '01011111111',
      name: 'New User',
      passwordHash: 'hash',
      systemRole: SystemRole.CUSTOMER,
    });
    userService.hashAndCreateUser.mockResolvedValue(user);
    authUtils.createAccessToken.mockReturnValue('access');
    authUtils.createRefreshToken.mockReturnValue('refresh');

    await expect(
      service.register({
        email: user.email,
        phone: user.phone,
        name: user.name,
        password: 'Password123',
        role: SystemRole.CUSTOMER,
      } as never),
    ).resolves.toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { id: 10 },
    });
    expect(transaction.commit).toHaveBeenCalled();
  });

  it('registers a restaurant owner and membership', async () => {
    const user = new User({
      id: 11,
      email: 'owner@example.com',
      phone: '01022222222',
      name: 'Owner',
      passwordHash: 'hash',
      systemRole: SystemRole.RESTAURANT_USER,
    });
    userService.hashAndCreateUser.mockResolvedValue(user);
    restaurantService.create.mockResolvedValue({ id: 12, name: 'Kitchen' });

    await service.register({
      email: user.email,
      phone: user.phone,
      name: user.name,
      password: 'Password123',
      role: SystemRole.RESTAURANT_USER,
      restaurant: { name: 'Kitchen' },
    } as never);

    expect(memberService.createOwnerMember).toHaveBeenCalledWith(
      12,
      11,
      transaction,
    );
  });

  it('rejects forbidden or malformed registration and rolls back', async () => {
    await expect(
      service.register({ role: SystemRole.SYSTEM_ADMIN } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);

    userService.hashAndCreateUser.mockResolvedValue({
      id: 1,
      systemRole: SystemRole.RESTAURANT_USER,
    });
    await expect(
      service.register({
        role: SystemRole.RESTAURANT_USER,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('returns the neutral forgot-password response for unknown users', async () => {
    userService.findUserByEmail.mockResolvedValue(undefined);
    await expect(
      service.forgotPassword({ email: 'missing@example.com' }),
    ).resolves.toEqual({
      message: 'If an account exists, a password reset email has been sent.',
    });
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it('creates and emails a password-reset OTP', async () => {
    userService.findUserByEmail.mockResolvedValue({
      id: 2,
      email: 'reset@example.com',
    });
    authUtils.generateAndSaveOTP.mockResolvedValue('123456');

    await service.forgotPassword({ email: 'reset@example.com' });

    expect(emailProvider.send).toHaveBeenCalledWith(
      'reset@example.com',
      expect.any(String),
      expect.stringContaining('123456'),
    );
  });

  it('resets a password and consumes the OTP', async () => {
    const user = { id: 3, email: 'reset@example.com' };
    userService.findUserByEmail.mockResolvedValue(user);
    passwordResetRepo.findLatestPasswordResetByUserId.mockResolvedValue({
      id: 6,
      otpHash: 'otp-hash',
      isExpired: () => false,
    });
    authUtils.hashOTP.mockReturnValue('otp-hash');
    authUtils.hashPassword.mockResolvedValue('password-hash');

    await expect(
      service.resetPassword({
        email: user.email,
        otp: '123456',
        newPassword: 'NewPassword123',
      }),
    ).resolves.toBe(user);
    expect(userService.updatePassword).toHaveBeenCalledWith(
      3,
      'password-hash',
      undefined,
    );
    expect(
      passwordResetRepo.updatePasswordResetConsumedAt,
    ).toHaveBeenCalledWith(6, undefined);
  });

  it.each([
    ['missing user', undefined, undefined, 'otp-hash'],
    ['missing reset', { id: 3 }, undefined, 'otp-hash'],
    [
      'invalid OTP',
      { id: 3 },
      { id: 6, otpHash: 'different', isExpired: () => false },
      'otp-hash',
    ],
    [
      'expired OTP',
      { id: 3 },
      { id: 6, otpHash: 'otp-hash', isExpired: () => true },
      'otp-hash',
    ],
  ])('rejects reset for %s', async (_label, user, reset, inputHash) => {
    userService.findUserByEmail.mockResolvedValue(user);
    passwordResetRepo.findLatestPasswordResetByUserId.mockResolvedValue(reset);
    authUtils.hashOTP.mockReturnValue(inputHash);

    await expect(
      service.resetPassword({
        email: 'reset@example.com',
        otp: '123456',
        newPassword: 'NewPassword123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refreshes a valid token and rejects an invalid token', async () => {
    authUtils.verifyRefreshToken.mockReturnValue({
      userId: 3,
      email: 'user@example.com',
      role: SystemRole.CUSTOMER,
    });
    userService.getByUserId.mockResolvedValue({ id: 3 });
    authUtils.createAccessToken.mockReturnValue('new-access');

    await expect(service.refreshAccessToken('valid')).resolves.toEqual({
      accessToken: 'new-access',
    });

    authUtils.verifyRefreshToken.mockImplementation(() => {
      throw new Error('invalid');
    });
    await expect(service.refreshAccessToken('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts an invite atomically and rolls back failures', async () => {
    const user = { id: 4 };
    jest.spyOn(service, 'resetPassword').mockResolvedValueOnce(user as never);

    await expect(service.acceptInvite({} as never)).resolves.toBe(user);
    expect(memberService.activateInvite).toHaveBeenCalledWith(4, transaction);

    jest
      .spyOn(service, 'resetPassword')
      .mockRejectedValueOnce(new Error('reset failed'));
    await expect(service.acceptInvite({} as never)).rejects.toThrow(
      'reset failed',
    );
    expect(transaction.rollback).toHaveBeenCalled();
  });
});
