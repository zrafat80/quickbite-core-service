import { RoleRepository } from 'src/app/rbac/repository/role.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('RoleRepository', () => {
  it('finds role ids and returns null for missing roles', async () => {
    const { knex, query } = createKnexMock();
    const repository = new RoleRepository(knex as never);
    query.first
      .mockResolvedValueOnce({ id: '3' })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ id: 4 });

    await expect(repository.findRoleIdByName('manager')).resolves.toBe(3);
    await expect(repository.findRoleIdByName('missing')).resolves.toBeNull();
    await expect(repository.findRoleByName('staff')).resolves.toBe(4);
  });
});
