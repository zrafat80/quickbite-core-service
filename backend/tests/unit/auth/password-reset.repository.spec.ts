import { PasswordResetRepository } from 'src/app/auth/repository/password-reset.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('PasswordResetRepository', () => {
  let knex: ReturnType<typeof createKnexMock>['knex'];
  let query: ReturnType<typeof createKnexMock>['query'];
  let repository: PasswordResetRepository;
  const row = {
    id: 2,
    user_id: 4,
    otp_hash: 'hash',
    expires_at: new Date('2026-06-07T11:00:00.000Z'),
    consumed_at: null,
    created_at: new Date('2026-06-07T10:00:00.000Z'),
  };

  beforeEach(() => {
    ({ knex, query } = createKnexMock());
    repository = new PasswordResetRepository(knex as never);
  });

  it('creates password resets', async () => {
    query.insert.mockResolvedValue(undefined);
    await repository.createPasswordReset({
      userId: 4,
      otpHash: 'hash',
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    });
    expect(query.insert).toHaveBeenCalledWith({
      user_id: 4,
      otp_hash: 'hash',
      expires_at: row.expires_at,
      created_at: row.created_at,
    });
  });

  it('finds and maps the latest unconsumed reset', async () => {
    query.first.mockResolvedValueOnce(row).mockResolvedValue(undefined);
    await expect(
      repository.findLatestPasswordResetByUserId(4),
    ).resolves.toMatchObject({
      id: 2,
      userId: 4,
      otpHash: 'hash',
    });
    await expect(
      repository.findLatestPasswordResetByUserId(99),
    ).resolves.toBeUndefined();
  });

  it('marks a reset consumed', async () => {
    query.update.mockResolvedValue(1);
    await repository.updatePasswordResetConsumedAt(2);
    expect(query.update).toHaveBeenCalledWith({
      consumed_at: expect.any(Date),
    });
  });
});
