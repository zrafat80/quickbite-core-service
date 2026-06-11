import { SystemRole } from 'src/app/user/enums';
import { UserRepository } from 'src/app/user/repository/user.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('UserRepository', () => {
  let knex: ReturnType<typeof createKnexMock>['knex'];
  let query: ReturnType<typeof createKnexMock>['query'];
  let repository: UserRepository;
  const row = {
    id: 4,
    email: 'user@example.com',
    phone: '01000000000',
    name: 'User',
    password_hash: 'hash',
    system_role: SystemRole.CUSTOMER,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(() => {
    ({ knex, query } = createKnexMock());
    repository = new UserRepository(knex as never);
  });

  it('finds users by email and id', async () => {
    query.first.mockResolvedValueOnce(row).mockResolvedValueOnce(undefined);
    await expect(repository.findUserByEmail(row.email)).resolves.toMatchObject({
      id: 4,
      passwordHash: 'hash',
    });
    await expect(
      repository.findUserByEmail('missing@example.com'),
    ).resolves.toBe(undefined);

    query.first.mockResolvedValue(row);
    await expect(repository.findUserById(4)).resolves.toMatchObject({
      email: row.email,
    });
  });

  it('uses an exists query for duplicate checks', async () => {
    knex.raw.mockResolvedValue({ rows: [{ exists: true }] });
    await expect(
      repository.findUserExistsByEmailOrPhone(row.email, row.phone),
    ).resolves.toBe(true);
  });

  it('creates users with snake-case persistence fields', async () => {
    query.returning.mockResolvedValue([row]);
    await expect(
      repository.createUser({
        email: row.email,
        phone: row.phone,
        name: row.name,
        passwordHash: row.password_hash,
        systemRole: row.system_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }),
    ).resolves.toMatchObject({ id: 4, systemRole: SystemRole.CUSTOMER });
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        password_hash: 'hash',
        system_role: SystemRole.CUSTOMER,
      }),
    );
  });

  it('updates passwords and non-empty profiles', async () => {
    query.update.mockResolvedValue(1);
    await repository.updateUserPassword(4, 'new-hash');
    expect(query.update).toHaveBeenCalledWith({ password_hash: 'new-hash' });

    await repository.updateProfile(4, {
      name: 'Updated',
      phone: '01111111111',
    });
    expect(query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated',
        phone: '01111111111',
        updated_at: expect.any(Date),
      }),
    );

    query.update.mockClear();
    await repository.updateProfile(4, {});
    expect(query.update).not.toHaveBeenCalled();
  });
});
