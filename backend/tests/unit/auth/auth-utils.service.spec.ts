import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { AuthUtilsService, JwtPayload } from 'src/app/auth/auth-utils.service';
import { PasswordResetRepository } from 'src/app/auth/repository/password-reset.repository';

describe('AuthUtilsService', () => {
  const config = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return values[key];
    }),
  };
  const passwordResetRepository = { createPasswordReset: jest.fn() };
  const service = new AuthUtilsService(
    config as unknown as ConfigService,
    passwordResetRepository as unknown as PasswordResetRepository,
    {} as Knex,
  );
  const payload: JwtPayload = {
    userId: 4,
    email: 'user@example.com',
    role: 'customer',
  };

  it('hashes and compares passwords', async () => {
    const hash = await service.hashPassword('Password123');
    await expect(service.comparePassword('Password123', hash)).resolves.toBe(
      true,
    );
    await expect(service.comparePassword('wrong', hash)).resolves.toBe(false);
  });

  it('creates and verifies access and refresh tokens', () => {
    const access = service.createAccessToken(payload);
    const refresh = service.createRefreshToken(payload);

    expect(service.verifyAccessToken(access)).toMatchObject(payload);
    expect(service.verifyRefreshToken(refresh)).toMatchObject(payload);
  });

  it('generates six-digit OTPs and hashes them consistently', () => {
    expect(service.generateOTP()).toMatch(/^\d{6}$/);
    expect(service.hashOTP('123456')).toHaveLength(64);
    expect(service.hashOTP('123456')).toBe(service.hashOTP('123456'));
  });

  it('persists a hashed OTP and returns the raw value', async () => {
    jest.spyOn(service, 'generateOTP').mockReturnValue('123456');
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000);

    await expect(service.generateAndSaveOTP(4, 60_000)).resolves.toBe('123456');
    expect(passwordResetRepository.createPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 4,
        otpHash: service.hashOTP('123456'),
        expiresAt: new Date(61_000),
      }),
      undefined,
    );
    now.mockRestore();
  });
});
