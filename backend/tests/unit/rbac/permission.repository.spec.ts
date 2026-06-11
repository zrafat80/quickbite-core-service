import { PermissionRepo } from 'src/app/rbac/repository/permission.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('PermissionRepo', () => {
  it('maps role permissions to resource-action strings', async () => {
    const { knex, query } = createKnexMock();
    query.where.mockResolvedValue([
      {
        id: 1,
        resource: 'orders',
        action: 'read',
        created_at: new Date(),
      },
      {
        id: 2,
        resource: 'orders',
        action: 'update',
        created_at: new Date(),
      },
    ]);
    const repository = new PermissionRepo(knex as never);

    await expect(
      repository.getPermissionsByRoleName('manager'),
    ).resolves.toEqual(['orders:read', 'orders:update']);
    expect(query.join).toHaveBeenCalledTimes(2);
  });
});
