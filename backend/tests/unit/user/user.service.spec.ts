import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthUtilsService } from 'src/app/auth/auth-utils.service';
import { SystemRole } from 'src/app/user/enums';
import { UserRepository } from 'src/app/user/repository/user.repository';
import { UserService } from 'src/app/user/user.service';

describe('UserService', () => {
  const repository = {
    findUserExistsByEmailOrPhone: jest.fn(),
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    updateUserPassword: jest.fn(),
    findUserById: jest.fn(),
    updateProfile: jest.fn(),
  };
  const authUtils = { hashPassword: jest.fn() };
  const service = new UserService(
    repository as unknown as UserRepository,
    authUtils as unknown as AuthUtilsService,
  );
  const user = {
    id: 8,
    email: 'user@example.com',
    phone: '01000000000',
    name: 'User',
    passwordHash: 'hash',
    systemRole: SystemRole.CUSTOMER,
  };

  it('delegates basic repository operations', async () => {
    repository.findUserExistsByEmailOrPhone.mockResolvedValue(true);
    repository.createUser.mockResolvedValue(user);
    repository.findUserByEmail.mockResolvedValue(user);

    await expect(service.checkUserExists(user.email, user.phone)).resolves.toBe(
      true,
    );
    await expect(service.createUser(user)).resolves.toBe(user);
    await expect(service.findUserByEmail(user.email)).resolves.toBe(user);
    await service.updatePassword(user.id, 'new-hash');
    expect(repository.updateUserPassword).toHaveBeenCalledWith(
      user.id,
      'new-hash',
      undefined,
    );
  });

  it('returns a sanitized profile', async () => {
    repository.findUserById.mockResolvedValue(user);

    await expect(service.getByUserId(user.id)).resolves.toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      systemRole: user.systemRole,
    });
  });

  it('rejects an unknown profile', async () => {
    repository.findUserById.mockResolvedValue(undefined);
    await expect(service.getByUserId(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and reloads a profile', async () => {
    repository.findUserById.mockResolvedValue({ ...user, name: 'Updated' });

    await expect(
      service.updateProfile(user.id, { name: 'Updated' } as never),
    ).resolves.toMatchObject({
      message: expect.any(String),
      user: { name: 'Updated' },
    });
  });

  it('hashes and creates a new user with deterministic timestamps', async () => {
    const now = new Date('2026-06-07T10:00:00.000Z');
    repository.findUserExistsByEmailOrPhone.mockResolvedValue(false);
    authUtils.hashPassword.mockResolvedValue('hashed-password');
    repository.createUser.mockImplementation(async (value) => value);

    await expect(
      service.hashAndCreateUser(
        { ...user, password: 'Password123' },
        SystemRole.CUSTOMER,
        undefined,
        now,
      ),
    ).resolves.toMatchObject({
      email: user.email,
      passwordHash: 'hashed-password',
      createdAt: now,
    });
  });

  it('rejects duplicate users before hashing', async () => {
    repository.findUserExistsByEmailOrPhone.mockResolvedValue(true);

    await expect(
      service.hashAndCreateUser(
        { ...user, password: 'Password123' },
        SystemRole.CUSTOMER,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(authUtils.hashPassword).not.toHaveBeenCalled();
  });
});
